package com.jaws.neolit.service;

import com.jaws.neolit.model.Book;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookService {
    public List<Book> getBooks() {
        // XSS 취약점을 프론트엔드에서 발생시키기 위한 악의적인 제목의 데이터
        return List.of(
            new Book("1", "Neural Networks 101", "AI Author"),
            new Book("2", "<img src=x onerror='alert(\"XSS Attack!\"); console.log(document.cookie);'>", "Hacker")
        );
    }
}