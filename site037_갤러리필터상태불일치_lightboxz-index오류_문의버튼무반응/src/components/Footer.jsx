function Footer() {
  const showPreparingAlert = (channel) => {
    alert(`${channel} 채널은 준비중입니다.`);
  };

  return (
    <footer className="site-footer">
      <div>
        <strong>Atelier Noir Studio</strong>
        <p>서울 용산구 한남대로 37, 4F</p>
        <p>hello@atelier-noir.kr · 02-9256-0370</p>
      </div>
      <div className="footer-links">
        <button type="button" onClick={() => showPreparingAlert('Instagram')}>
          Instagram
        </button>
        <button type="button" onClick={() => showPreparingAlert('Pinterest')}>
          Pinterest
        </button>
        <button type="button" onClick={() => showPreparingAlert('Vimeo')}>
          Vimeo
        </button>
      </div>
      <small>Copyright 2026 Atelier Noir Studio. site037 training build.</small>
    </footer>
  );
}

export default Footer;
