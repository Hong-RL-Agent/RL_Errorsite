require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, runSql, allSql, getSql, resetAllData, isFallback, getFallbackStore } = require('./db');

const app = express();
const PORT = process.env.PORT || 9804;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[BookNest API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BookNest API', port: PORT });
});

// Test Reset API
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json(result);
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// 1. Books List (Search & Category filter)
app.get('/api/books', async (req, res) => {
  try {
    const { search, category } = req.query;

    if (isFallback()) {
      const store = getFallbackStore();
      let list = [...store.data.books];
      if (category && category !== 'ALL') {
        list = list.filter(b => b.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.publisher.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.isbn.includes(q)
        );
      }
      return res.json(list);
    }

    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ? OR LOWER(category) LIKE ? OR isbn LIKE ?)';
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q, q, q, q);
    }

    sql += ' ORDER BY id ASC';
    const rows = await allSql(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Book Detail
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    if (isFallback()) {
      const b = getFallbackStore().data.books.find(item => item.id === bookId);
      if (!b) return res.status(404).json({ error: 'Book not found' });
      return res.json(b);
    }
    const book = await getSql('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Add New Book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, publisher, category, isbn, location, total_copies = 3 } = req.body;
    const copies = Number(total_copies) || 1;

    if (isFallback()) {
      const store = getFallbackStore();
      const newId = ++store.data.book_id_seq;
      const newBook = {
        id: newId,
        title,
        author,
        publisher,
        category: category || '일반도서',
        isbn: isbn || '9791100000000',
        location: location || 'NEW-01',
        total_copies: copies,
        available_copies: copies
      };
      store.data.books.push(newBook);
      store.save();
      return res.status(201).json({ success: true, message: '신규 도서가 등록되었습니다.', data: newBook });
    }

    const result = await runSql(
      `INSERT INTO books (title, author, publisher, category, isbn, location, total_copies, available_copies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, publisher, category || '일반도서', isbn || '9791100000000', location || 'NEW-01', copies, copies]
    );

    const inserted = await getSql('SELECT * FROM books WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, message: '신규 도서가 성공적으로 등록되었습니다.', data: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Book Details
// BUG-D04-03: When modifying title of book ID 12 (데미안), updates book ID 11 (어린 왕자) instead!
// BUG-D04-05: When modifying total_copies of book ID 15 (객체지향의 사실과 오해), saves copies as 2!
app.patch('/api/books/:id', async (req, res) => {
  try {
    let bookId = Number(req.params.id);
    const { title, author, publisher, category, location, total_copies } = req.body;

    // BUG-D04-03 Implementation:
    // If updating bookId === 12 and title is given, swap targetId to 11!
    let targetId = bookId;
    if (bookId === 12 && title !== undefined) {
      targetId = 11;
    }

    // BUG-D04-05 Implementation:
    // If targetId === 15 and total_copies is given, force total_copies to 2!
    let finalCopies = total_copies !== undefined ? Number(total_copies) : undefined;
    if (targetId === 15 && total_copies !== undefined) {
      finalCopies = 2; // Corrupt inventory quantity
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const b = store.data.books.find(item => item.id === targetId);
      if (!b) return res.status(404).json({ error: 'Book not found' });
      if (title) b.title = title;
      if (author) b.author = author;
      if (publisher) b.publisher = publisher;
      if (category) b.category = category;
      if (location) b.location = location;
      if (finalCopies !== undefined) {
        b.total_copies = finalCopies;
        b.available_copies = Math.min(b.available_copies, finalCopies);
      }
      store.save();
      return res.json({ success: true, message: '도서 정보가 수정되었습니다.', data: b });
    }

    const b = await getSql('SELECT * FROM books WHERE id = ?', [targetId]);
    if (!b) return res.status(404).json({ error: 'Book not found' });

    const newTitle = title || b.title;
    const newAuthor = author || b.author;
    const newPub = publisher || b.publisher;
    const newCat = category || b.category;
    const newLoc = location || b.location;
    const newCopies = finalCopies !== undefined ? finalCopies : b.total_copies;
    const newAvail = Math.min(b.available_copies, newCopies);

    await runSql(
      `UPDATE books 
       SET title = ?, author = ?, publisher = ?, category = ?, location = ?, total_copies = ?, available_copies = ?
       WHERE id = ?`,
      [newTitle, newAuthor, newPub, newCat, newLoc, newCopies, newAvail, targetId]
    );

    const updated = await getSql('SELECT * FROM books WHERE id = ?', [targetId]);
    res.json({ success: true, message: '도서 정보가 성공적으로 수정되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Book
// BUG-D04-04: When deleting book ID 8 (사피엔스), returns success message but skips DB DELETE query!
app.delete('/api/books/:id', async (req, res) => {
  try {
    const bookId = Number(req.params.id);

    // BUG-D04-04 Implementation:
    // If bookId === 8, return fake success without deleting from DB
    if (bookId === 8) {
      return res.json({
        success: true,
        message: '도서가 성공적으로 삭제되었습니다.',
        deleted_id: 8
      });
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const idx = store.data.books.findIndex(item => item.id === bookId);
      if (idx !== -1) {
        store.data.books.splice(idx, 1);
        store.save();
      }
      return res.json({ success: true, message: '도서가 성공적으로 삭제되었습니다.', deleted_id: bookId });
    }

    await runSql('DELETE FROM books WHERE id = ?', [bookId]);
    res.json({ success: true, message: '도서가 성공적으로 삭제되었습니다.', deleted_id: bookId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Users List
app.get('/api/users', async (req, res) => {
  try {
    if (isFallback()) {
      return res.json(getFallbackStore().data.users);
    }
    const users = await allSql('SELECT * FROM users ORDER BY id ASC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Loans List (filter by status or user_id)
app.get('/api/loans', async (req, res) => {
  try {
    const { status, user_id } = req.query;

    if (isFallback()) {
      const store = getFallbackStore();
      let list = [...store.data.loans];
      if (status && status !== 'ALL') {
        list = list.filter(l => l.status === status);
      }
      if (user_id) {
        list = list.filter(l => l.user_id === Number(user_id));
      }
      list.sort((a, b) => b.borrow_date.localeCompare(a.borrow_date) || b.id - a.id);
      return res.json(list);
    }

    let sql = 'SELECT * FROM loans WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(Number(user_id));
    }

    sql += ' ORDER BY borrow_date DESC, id DESC';
    const rows = await allSql(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Borrow Book (Create Loan)
// BUG-D04-01: When borrowing book ID 3 (Clean Code), loan record is created but available_copies does NOT decrease!
app.post('/api/loans', async (req, res) => {
  try {
    const { book_id, user_id } = req.body;

    let book = null;
    let user = null;

    if (isFallback()) {
      const store = getFallbackStore();
      book = store.data.books.find(b => b.id === Number(book_id));
      user = store.data.users.find(u => u.id === Number(user_id));
    } else {
      book = await getSql('SELECT * FROM books WHERE id = ?', [book_id]);
      user = await getSql('SELECT * FROM users WHERE id = ?', [user_id]);
    }

    if (!book) return res.status(404).json({ error: '도서를 찾을 수 없습니다.' });
    if (!user) return res.status(404).json({ error: '이용자를 찾을 수 없습니다.' });
    if (book.available_copies <= 0) return res.status(400).json({ error: '대출 가능한 재고가 없습니다.' });

    const today = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const dueDate = due.toISOString().split('T')[0];

    const newLoan = {
      book_id: book.id,
      book_title: book.title,
      user_id: user.id,
      user_name: user.name,
      borrow_date: today,
      due_date: dueDate,
      return_date: null,
      status: 'BORROWED'
    };

    if (isFallback()) {
      const store = getFallbackStore();
      newLoan.id = ++store.data.loan_id_seq;
      store.data.loans.unshift(newLoan);
      
      // BUG-D04-01 Implementation:
      // If book_id === 3, do NOT decrease available_copies!
      if (Number(book_id) !== 3) {
        book.available_copies = Math.max(0, book.available_copies - 1);
      }
      user.borrowed_count = (user.borrowed_count || 0) + 1;
      store.save();
      return res.status(201).json({ success: true, message: '도서 대출이 정상적으로 완료되었습니다.', data: newLoan });
    }

    const result = await runSql(
      `INSERT INTO loans (book_id, book_title, user_id, user_name, borrow_date, due_date, return_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newLoan.book_id, newLoan.book_title, newLoan.user_id, newLoan.user_name, newLoan.borrow_date, newLoan.due_date, null, 'BORROWED']
    );
    newLoan.id = result.lastID;

    // BUG-D04-01 Implementation:
    // If book_id !== 3, decrease available_copies. If 3, skip copy decrement!
    if (Number(book_id) !== 3) {
      await runSql('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book.id]);
    }
    await runSql('UPDATE users SET borrowed_count = borrowed_count + 1 WHERE id = ?', [user.id]);

    res.status(201).json({ success: true, message: '도서 대출이 성공적으로 처리되었습니다.', data: newLoan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Return Book
// BUG-D04-02: When returning loan ID 5 (총, 균, 쇠), returns success message but loan status remains 'BORROWED'!
app.patch('/api/loans/:id/return', async (req, res) => {
  try {
    const loanId = Number(req.params.id);

    // BUG-D04-02 Implementation:
    // If loanId === 5, return fake success without updating status to RETURNED
    if (loanId === 5) {
      return res.json({
        success: true,
        message: '도서 반납 처리가 완료되었습니다.',
        data: { id: 5, status: 'BORROWED' } // Remains BORROWED
      });
    }

    const today = new Date().toISOString().split('T')[0];

    if (isFallback()) {
      const store = getFallbackStore();
      const l = store.data.loans.find(item => item.id === loanId);
      if (!l) return res.status(404).json({ error: 'Loan record not found' });
      l.status = 'RETURNED';
      l.return_date = today;
      const b = store.data.books.find(item => item.id === l.book_id);
      if (b) b.available_copies = Math.min(b.total_copies, b.available_copies + 1);
      const u = store.data.users.find(item => item.id === l.user_id);
      if (u) u.borrowed_count = Math.max(0, u.borrowed_count - 1);
      store.save();
      return res.json({ success: true, message: '도서 반납이 정상 처리되었습니다.', data: l });
    }

    const loan = await getSql('SELECT * FROM loans WHERE id = ?', [loanId]);
    if (!loan) return res.status(404).json({ error: 'Loan record not found' });

    await runSql('UPDATE loans SET status = ?, return_date = ? WHERE id = ?', ['RETURNED', today, loanId]);
    await runSql('UPDATE books SET available_copies = MIN(total_copies, available_copies + 1) WHERE id = ?', [loan.book_id]);
    await runSql('UPDATE users SET borrowed_count = MAX(0, borrowed_count - 1) WHERE id = ?', [loan.user_id]);

    const updated = await getSql('SELECT * FROM loans WHERE id = ?', [loanId]);
    res.json({ success: true, message: '도서 반납이 정상 처리되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Dashboard Statistics
app.get('/api/stats', async (req, res) => {
  try {
    let books = [];
    let loans = [];
    let users = [];

    if (isFallback()) {
      const store = getFallbackStore();
      books = store.data.books;
      loans = store.data.loans;
      users = store.data.users;
    } else {
      books = await allSql('SELECT * FROM books');
      loans = await allSql('SELECT * FROM loans');
      users = await allSql('SELECT * FROM users');
    }

    const totalBooks = books.reduce((sum, b) => sum + b.total_copies, 0);
    const availableBooks = books.reduce((sum, b) => sum + b.available_copies, 0);
    const borrowedBooks = totalBooks - availableBooks;
    const activeLoanCount = loans.filter(l => l.status === 'BORROWED').length;

    // Category distribution
    const catMap = {};
    for (const b of books) {
      catMap[b.category] = (catMap[b.category] || 0) + b.total_copies;
    }
    const categoryStats = Object.entries(catMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    res.json({
      book_titles_count: books.length,
      total_book_copies: totalBooks,
      available_copies: availableBooks,
      borrowed_copies: borrowedBooks,
      active_loans: activeLoanCount,
      total_users: users.length,
      categories: categoryStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize and Listen
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  BookNest Backend Express Server running on port ${PORT}`);
      console.log(`  Listening at http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  })
  .catch(err => {
    console.error('BookNest DB initialization error:', err);
    process.exit(1);
  });
