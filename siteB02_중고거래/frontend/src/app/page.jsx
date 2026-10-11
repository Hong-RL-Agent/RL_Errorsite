"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import ToastStack from "../components/ToastStack";
import { useToast } from "../hooks/useToast";

const CURRENT_USER_ID = 1;
const BUG_RESERVATION_PRODUCTS = new Set(["P0007", "P0021"]);
const BUG_DELETE_PRODUCTS = new Set(["P0012"]);
const PAGE_SIZE = 12;

const emptyForm = {
  title: "",
  category: "디지털기기",
  price: 45000,
  region: "서울 마포구",
  description: "",
  image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [seller, setSeller] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [region, setRegion] = useState("전체");
  const [sort, setSort] = useState("latest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [reservationOpen, setReservationOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [productForm, setProductForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [messageText, setMessageText] = useState("");
  const { toasts, pushToast } = useToast();

  const regions = useMemo(() => ["전체", "서울 마포구", "서울 송파구", "경기 성남시", "부산 해운대구", "대전 유성구", "광주 북구"], []);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.productId)), [favorites]);
  const myProducts = useMemo(() => products.filter((product) => product.sellerId === CURRENT_USER_ID), [products]);
  const visibleCount = products.length;

  async function loadProducts(nextPage = 1, append = false) {
    const params = {
      page: String(nextPage),
      limit: String(PAGE_SIZE),
      q: query,
      category: category === "전체" ? "" : category,
      region: region === "전체" ? "" : region,
      sort,
      minPrice,
      maxPrice
    };
    const data = await api.getProducts(params);
    setTotal(data.total);
    setPage(nextPage);
    if (append) {
      setProducts((current) => {
        // INTENTIONAL_ERROR: B02-ERR05
        // CSV Error: 페이징 드리프트 및 리스트 중복
        // Strategy: ACTION_REPLAY
        // Description: 상품 더보기 병합 시 이전 페이지 마지막 상품이 중복 추가됨.
        const repeatedTail = current.slice(-3);
        return [...current, ...repeatedTail, ...data.items];
      });
      return;
    }
    setProducts(data.items);
  }

  async function loadSideData() {
    const [fav, res, tx, note, act, chat] = await Promise.all([
      api.getFavorites(CURRENT_USER_ID),
      api.getReservations(CURRENT_USER_ID),
      api.getTransactions(CURRENT_USER_ID),
      api.getNotifications(CURRENT_USER_ID),
      api.getActivity(CURRENT_USER_ID),
      api.getChats(CURRENT_USER_ID)
    ]);
    setFavorites(fav.items);
    setReservations(res.items);
    setTransactions(tx.items);
    setNotifications(note.items);
    setActivity(act.items);
    setChats(chat.items);
    if (!selectedChat && chat.items[0]) {
      setSelectedChat(chat.items[0]);
    }
  }

  async function selectProduct(productId) {
    const detail = await api.getProduct(productId);
    setSelectedProduct(detail.product);
    setSeller(detail.seller);
  }

  async function refreshAll() {
    const [cats] = await Promise.all([api.getCategories(), loadProducts(1, false), loadSideData()]);
    setCategories(["전체", ...cats.items]);
  }

  useEffect(() => {
    refreshAll().catch((error) => pushToast(error.message, "error"));
  }, []);

  useEffect(() => {
    loadProducts(1, false).catch((error) => pushToast(error.message, "error"));
  }, [category, region, sort]);

  useEffect(() => {
    if (!selectedProduct && products[0]) {
      selectProduct(products[0].id).catch((error) => pushToast(error.message, "error"));
    }
  }, [products, selectedProduct]);

  useEffect(() => {
    if (selectedChat) {
      api.getMessages(selectedChat.id).then((data) => setMessages(data.items)).catch((error) => pushToast(error.message, "error"));
    }
  }, [selectedChat]);

  async function handleSearch(event) {
    event.preventDefault();
    await loadProducts(1, false);
    pushToast("상품 목록을 검색했습니다.");
  }

  async function handleFavorite() {
    if (!selectedProduct) return;
    const isFavorite = favoriteIds.has(selectedProduct.id);
    if (isFavorite) {
      await api.removeFavorite(selectedProduct.id, CURRENT_USER_ID);
      setFavorites((current) => current.filter((item) => item.productId !== selectedProduct.id));
      setSelectedProduct((current) => ({ ...current, favoriteCount: Math.max(0, current.favoriteCount - 1), isFavorite: false }));
      pushToast("찜을 취소했습니다.");
      return;
    }
    await api.addFavorite({ userId: CURRENT_USER_ID, productId: selectedProduct.id });
    // INTENTIONAL_ERROR: B02-ERR02
    // CSV Error: 캐시 상태 불일치
    // Strategy: ACTION_REPLAY
    // Description: 상세 하트만 갱신하고 헤더 카운트와 기존 찜 목록 캐시는 갱신하지 않음.
    setSelectedProduct((current) => ({ ...current, favoriteCount: current.favoriteCount + 1, isFavorite: true }));
    pushToast("상품을 찜했습니다.");
  }

  async function createOneReservation() {
    if (!selectedProduct) return null;
    return api.createReservation({
      productId: selectedProduct.id,
      buyerId: CURRENT_USER_ID,
      sellerId: selectedProduct.sellerId,
      meetAt: "이번 주 토요일 오후 2시",
      memo: "직거래 예약 요청"
    });
  }

  async function handleReserve() {
    if (!selectedProduct) return;
    if (selectedProduct.status !== "판매중") {
      pushToast("판매중 상품만 예약할 수 있습니다.", "error");
      return;
    }
    // INTENTIONAL_ERROR: B02-ERR01
    // CSV Error: 의도치 않은 더블 클릭 (이벤트 중복)
    // Strategy: ACTION_REPLAY
    // Description: 거래 예약 이벤트가 중복 실행됨.
    if (BUG_RESERVATION_PRODUCTS.has(selectedProduct.id)) {
      await Promise.all([createOneReservation(), createOneReservation()]);
    } else {
      await createOneReservation();
    }
    setReservationOpen(false);
    await loadSideData();
    await selectProduct(selectedProduct.id);
    pushToast("거래 예약이 등록되었습니다.");
  }

  async function handleReservationCancel(id) {
    await api.deleteReservation(id);
    await loadSideData();
    pushToast("예약을 취소했습니다.");
  }

  async function handleComplete(transactionId, silent = false) {
    await api.completeTransaction(transactionId);
    await Promise.all([loadProducts(1, false), loadSideData()]);
    if (selectedProduct) {
      await selectProduct(selectedProduct.id).catch(() => {});
    }
    // INTENTIONAL_ERROR: B02-ERR04
    // CSV Error: 성공/실패 피드백 부재
    // Strategy: ACTION_REPLAY
    // Description: 거래 완료 상태 변경 후 성공 토스트를 표시하지 않음.
    if (!silent) {
      pushToast("거래 완료로 변경했습니다.");
    }
  }

  async function handleDelete(product) {
    if (BUG_DELETE_PRODUCTS.has(product.id)) {
      // INTENTIONAL_ERROR: B02-ERR03
      // CSV Error: 행동 확인 없음
      // Strategy: ACTION_REPLAY
      // Description: 특정 상품 삭제 버튼이 확인 모달 없이 즉시 삭제 API를 호출함.
      await api.deleteProduct(product.id);
      setSelectedProduct(null);
      await loadProducts(1, false);
      pushToast("상품을 삭제했습니다.");
      return;
    }
    setDeleteTarget(product);
  }

  async function confirmDelete() {
    await api.deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    setSelectedProduct(null);
    await loadProducts(1, false);
    pushToast("상품을 삭제했습니다.");
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    const body = { ...productForm, sellerId: CURRENT_USER_ID };
    if (editingProduct) {
      await api.updateProduct(editingProduct.id, body);
      pushToast("상품 정보를 수정했습니다.");
    } else {
      await api.createProduct(body);
      pushToast("상품을 등록했습니다.");
    }
    setProductForm(emptyForm);
    setEditingProduct(null);
    await loadProducts(1, false);
  }

  function startEdit(product) {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      category: product.category,
      price: product.price,
      region: product.region,
      description: product.description,
      image: product.image
    });
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedChat || !messageText.trim()) return;
    await api.sendMessage(selectedChat.id, { senderId: CURRENT_USER_ID, body: messageText.trim() });
    setMessageText("");
    const data = await api.getMessages(selectedChat.id);
    setMessages(data.items);
    pushToast("채팅 메시지를 보냈습니다.");
  }

  async function resetData() {
    await api.reset();
    setSelectedProduct(null);
    setFavorites([]);
    setProducts([]);
    setPage(1);
    await refreshAll();
    pushToast("초기 데이터로 복원했습니다.");
  }

  const canLoadMore = visibleCount < total;

  return (
    <main>
      <header className="topbar">
        <div className="brand" onClick={() => loadProducts(1, false)}>
          <span className="brandMark">R</span>
          <span>ReMarket</span>
        </div>
        <form className="search" onSubmit={handleSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품명, 판매자, 설명 검색" />
          <button type="submit">검색</button>
        </form>
        <div className="headerStats">
          <span data-bug-id="B02-ERR02">찜 {favorites.length}</span>
          <span>알림 {notifications.length}</span>
          <button onClick={resetData}>데이터 초기화</button>
        </div>
      </header>

      <section className="filters">
        <nav>
          {categories.map((item) => (
            <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </nav>
        <div className="filterControls">
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            {regions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="최소가" />
          <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="최대가" />
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="latest">최신순</option>
            <option value="priceAsc">낮은 가격순</option>
            <option value="priceDesc">높은 가격순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </section>

      <div className="layoutGrid">
        <section className="catalog">
          <div className="sectionHead">
            <div>
              <p>최신 등록 상품</p>
              <h1>동네에서 바로 거래하는 중고 물품</h1>
            </div>
            <strong>{total}개 상품</strong>
          </div>
          <div className="productGrid">
            {products.map((product, index) => (
              <article className="productCard" key={`${product.id}-${index}`} onClick={() => selectProduct(product.id)} data-product-id={product.id} data-bug-id={index >= PAGE_SIZE && products.findIndex((item) => item.id === product.id) !== index ? "B02-ERR05" : undefined}>
                <img src={product.image} alt="" />
                <div className="cardBody">
                  <span className={`badge ${product.status}`}>{product.status}</span>
                  <h3>{product.title}</h3>
                  <strong>{product.price.toLocaleString()}원</strong>
                  <p>{product.region} · {product.createdAt.slice(0, 10)} · 찜 {product.favoriteCount}</p>
                </div>
              </article>
            ))}
          </div>
          {canLoadMore && (
            <button className="loadMore" onClick={() => loadProducts(page + 1, true)} data-bug-id="B02-ERR05">
              상품 더보기
            </button>
          )}
        </section>

        <aside className="detailPanel">
          {selectedProduct && (
            <>
              <div className="gallery">
                <img src={selectedProduct.image} alt="" />
                <div>
                  <img src={selectedProduct.image} alt="" />
                  <img src={selectedProduct.image} alt="" />
                </div>
              </div>
              <div className="detailTitle">
                <span className={`badge ${selectedProduct.status}`}>{selectedProduct.status}</span>
                <h2>{selectedProduct.title}</h2>
                <strong>{selectedProduct.price.toLocaleString()}원</strong>
              </div>
              <p className="description">{selectedProduct.description}</p>
              <div className="sellerPanel">
                <div>
                  <strong>{seller?.name}</strong>
                  <p>{seller?.region} · 신뢰 {seller?.trustScore}</p>
                </div>
                <span>{seller?.soldCount}회 거래</span>
              </div>
              <div className="detailActions">
                <button onClick={handleFavorite} data-bug-id="B02-ERR02">{selectedProduct.isFavorite ? "♥ 찜함" : "♡ 찜하기"}</button>
                <button onClick={() => setReservationOpen(true)} data-bug-id="B02-ERR01">거래 예약</button>
              </div>
            </>
          )}
        </aside>
      </div>

      <section className="dashboard">
        <div className="panel">
          <h2>판매 상품 등록 및 수정</h2>
          <form className="productForm" onSubmit={handleProductSubmit}>
            <input value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} placeholder="상품명" required />
            <select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>
              {categories.filter((item) => item !== "전체").map((item) => <option key={item}>{item}</option>)}
            </select>
            <input type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} />
            <input value={productForm.region} onChange={(event) => setProductForm({ ...productForm, region: event.target.value })} />
            <input value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} />
            <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="상품 설명" />
            <button type="submit">{editingProduct ? "수정 저장" : "상품 등록"}</button>
          </form>
        </div>

        <div className="panel">
          <h2>내 판매 목록</h2>
          <div className="list">
            {myProducts.slice(0, 8).map((product) => (
              <div className="listItem" key={product.id}>
                <span className={`badge ${product.status}`}>{product.status}</span>
                <div>
                  <strong>{product.title}</strong>
                  <p>{product.price.toLocaleString()}원</p>
                </div>
                <button onClick={() => startEdit(product)}>수정</button>
                <button onClick={() => handleDelete(product)} data-bug-id={BUG_DELETE_PRODUCTS.has(product.id) ? "B02-ERR03" : undefined}>삭제</button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>거래 예약 및 구매 내역</h2>
          <div className="list">
            {reservations.slice(0, 8).map((reservation) => (
              <div className="listItem" key={reservation.id}>
                <span>{reservation.status}</span>
                <div>
                  <strong>{reservation.productTitle}</strong>
                  <p>{reservation.meetAt}</p>
                </div>
                <button onClick={() => handleReservationCancel(reservation.id)}>예약 취소</button>
              </div>
            ))}
            {transactions.slice(0, 5).map((transaction) => (
              <div className="listItem" key={transaction.id}>
                <span>{transaction.status}</span>
                <div>
                  <strong>{transaction.productTitle}</strong>
                  <p>{transaction.price.toLocaleString()}원</p>
                </div>
                {transaction.status === "예약중" && (
                  <button onClick={() => handleComplete(transaction.id, transaction.productId === "P0018")} data-bug-id={transaction.productId === "P0018" ? "B02-ERR04" : undefined}>
                    거래 완료 처리
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="community">
        <div className="panel chatPanel">
          <h2>판매자·구매자 채팅</h2>
          <div className="chatLayout">
            <div className="chatList">
              {chats.slice(0, 8).map((chat) => (
                <button className={selectedChat?.id === chat.id ? "active" : ""} key={chat.id} onClick={() => setSelectedChat(chat)}>
                  {chat.productTitle}
                </button>
              ))}
            </div>
            <div className="messages">
              {messages.slice(-7).map((message) => (
                <p className={message.senderId === CURRENT_USER_ID ? "mine" : ""} key={message.id}>{message.body}</p>
              ))}
              <form onSubmit={sendMessage}>
                <input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="메시지 입력" />
                <button type="submit">전송</button>
              </form>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>거래 알림</h2>
          <div className="list compact">
            {notifications.slice(0, 7).map((item) => <p key={item.id}>{item.message}</p>)}
          </div>
        </div>

        <div className="panel">
          <h2>활동 내역</h2>
          <div className="list compact">
            {activity.slice(0, 7).map((item) => <p key={item.id}>{item.message}</p>)}
          </div>
        </div>
      </section>

      {reservationOpen && selectedProduct && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>거래 예약</h2>
            <p>{selectedProduct.title} 상품을 직거래로 예약합니다.</p>
            <div className="modalActions">
              <button onClick={() => setReservationOpen(false)}>취소</button>
              <button onClick={handleReserve} data-bug-id="B02-ERR01">거래 예약하기</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>상품 삭제 확인</h2>
            <p>{deleteTarget.title} 상품을 삭제할까요?</p>
            <div className="modalActions">
              <button onClick={() => setDeleteTarget(null)}>취소</button>
              <button onClick={confirmDelete}>삭제</button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </main>
  );
}
