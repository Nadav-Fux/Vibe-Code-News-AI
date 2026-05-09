// Chat skin component — switchable between WhatsApp / Telegram / Messenger
const { useState: useS1, useEffect: useE1, useRef: useR1 } = React;

function ChatPanel({ skin = 'whatsapp', onSkinChange, variant = 'v1' }) {
  const { items, typing } = useTicker(TICKER_MESSAGES, 4200);
  const scrollerRef = useR1(null);

  useE1(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [items, typing]);

  const skinConfig = {
    whatsapp: {
      name: 'WhatsApp',
      headerBg: '#075E54',
      headerText: '#fff',
      bg: '#ECE5DD',
      bgPattern: true,
      bubbleBg: '#DCF8C6',
      bubbleOther: '#fff',
      timeColor: '#667781',
      icon: 'W',
      iconBg: '#25D366',
    },
    telegram: {
      name: 'Telegram',
      headerBg: '#517DA2',
      headerText: '#fff',
      bg: '#E7EBF0',
      bgPattern: false,
      bubbleBg: '#EFFDDE',
      bubbleOther: '#fff',
      timeColor: '#5C9CDB',
      icon: 'T',
      iconBg: '#2AABEE',
    },
    messenger: {
      name: 'Messenger',
      headerBg: '#fff',
      headerText: '#050505',
      bg: '#fff',
      bgPattern: false,
      bubbleBg: '#0084FF',
      bubbleOther: '#F0F0F0',
      timeColor: '#65676B',
      icon: 'M',
      iconBg: 'linear-gradient(135deg, #0695FF 0%, #A334FA 50%, #FF6968 100%)',
    },
  };
  const cfg = skinConfig[skin];

  return (
    <div className={`chat-panel chat-${skin} chat-${variant}`}>
      <div className="chat-skin-tabs">
        {Object.keys(skinConfig).map(k => (
          <button key={k} className={`chat-tab ${skin === k ? 'active' : ''}`} onClick={() => onSkinChange(k)} data-cursor data-cursor-label="החלף סקין">
            {skinConfig[k].name}
          </button>
        ))}
      </div>

      <div className="chat-window">
        <div className="chat-header" style={{ background: cfg.headerBg, color: cfg.headerText }}>
          <div className="chat-avatar" style={{ background: cfg.iconBg }}>
            <span>n.</span>
            <span className="chat-avatar-pulse"></span>
          </div>
          <div className="chat-meta">
            <div className="chat-title">nVision AI · ערוץ מבזקים</div>
            <div className="chat-status">
              <span className="chat-online-dot"></span>
              {typing ? 'כותב/ת...' : '12,847 חברים · מקוונים'}
            </div>
          </div>
          <div className="chat-actions">
            <span>⌕</span>
            <span>⋮</span>
          </div>
        </div>

        <div ref={scrollerRef} className={`chat-body ${cfg.bgPattern ? 'wa-pattern' : ''}`} style={{ background: cfg.bg }}>
          <div className="chat-day-divider"><span>היום</span></div>

          {items.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.fresh ? 'fresh' : ''} ${msg.urgent ? 'urgent' : ''}`}>
              <div className="chat-bubble" style={{ background: cfg.bubbleOther }}>
                {msg.urgent && <span className="chat-urgent">⚡ מבזק</span>}
                <span className="chat-tag" data-tag={msg.tag}>{msg.tag}</span>
                <p>{msg.text}</p>
                <div className="chat-time" style={{ color: cfg.timeColor }}>
                  {msg.time}
                  <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                    <path d="M1 4.5L4 7.5L9 1.5M5 7.5L8 4.5L13 1.5" stroke={skin === 'messenger' ? '#0084FF' : '#4FC3F7'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="chat-msg typing">
              <div className="chat-bubble" style={{ background: cfg.bubbleOther }}>
                <div className="chat-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-bar" style={{ background: skin === 'messenger' ? '#fff' : '#F0F2F5' }}>
          <span className="chat-input-icon">😊</span>
          <input className="chat-input" placeholder="הצטרפ/י לערוץ כדי לקבל מבזקים..." readOnly />
          <button className="chat-send" data-cursor data-cursor-label="הצטרף">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12L19 12M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className="chat-cta-row">
        <a className="chat-cta whatsapp" data-cursor data-cursor-label="WhatsApp">
          <span className="chat-cta-dot"></span>
          הצטרף ב־WhatsApp
        </a>
        <a className="chat-cta telegram" data-cursor data-cursor-label="Telegram">
          <span className="chat-cta-dot"></span>
          Telegram Channel
        </a>
        <span className="chat-subscribers">12,847 מנויים פעילים</span>
      </div>
    </div>
  );
}

window.ChatPanel = ChatPanel;
