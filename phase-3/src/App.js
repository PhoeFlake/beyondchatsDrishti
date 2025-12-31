import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const API = process.env.REACT_APP_API || "http://localhost:5000";
  useEffect(() => {
    fetchArticles();
  }, [showAll]);
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const endpoint = showAll ? `${API}/articles` : `${API}/articles/oldest`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setArticles(data);
      if (!showAll) {
        const countRes = await fetch(`${API}/articles`);
        const countData = await countRes.json();
        setTotalCount(countData.length);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="container">
        <h2 style={{textAlign:"center", marginTop: "100px"}}>Loading articles...</h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container">
        <h2 style={{textAlign:"center", marginTop: "100px", color: "#ef4444"}}>
          Error: {error}
        </h2>
        <p style={{textAlign:"center", color: "#9ca3af"}}>
          Make sure your API is running on {API}
        </p>
      </div>
    );
  }
  const displayedArticles = articles;
  const enhancedCount = articles.filter(a => a.rewritten_content && a.rewritten_content.trim().length > 0).length;
  return (
    <div className="app">
      {/* Simple Header with Logo */}
      <header className="simple-header">
        <div className="logo-container">
          <img 
            src="/logo.png"
            alt="BeyondChats Logo"
            className="logo"
          />
          <span className="brand-text">BeyondChats</span>
        </div>
      </header>
      <div className="container">
        {/* Articles Grid */}
        <div className="articles-section">
          <div className="grid">
            {displayedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
          {!showAll && totalCount > 5 && (
            <div className="more-button-container">
              <button 
                className="more-button"
                onClick={() => setShowAll(true)}>
                View All Articles ({totalCount - 5} more)
              </button>
            </div>
          )}
          {showAll && (
            <div className="more-button-container">
              <button 
                className="more-button secondary"
                onClick={() => setShowAll(false)}>
                Show Less
              </button>
            </div>
          )}
        </div>
      </div>
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
function ArticleCard({ article, onClick }) {
  const isEnhanced = article.rewritten_content && article.rewritten_content.trim().length > 0;
  let contentPreview = isEnhanced 
    ? article.rewritten_content 
    : (article.original_content || 'No content available');
  contentPreview = contentPreview
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/={3,}/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return (
    <div className="card" onClick={onClick}>
      {isEnhanced && <span className="badge">Enhanced</span>}
      <h3>{article.title}</h3>
      <p className="content-preview">
        {contentPreview.substring(0, 200) + "..."}
      </p>
      <div className="card-footer">
        <div className="meta">
          {article.published_at 
            ? new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : "Date unknown"}
        </div>
        <div className="read-more">
          Read {isEnhanced ? 'comparison' : 'article'} →
        </div>
      </div>
    </div>
  );
}
function ArticleDetailModal({ article, onClose }) {
  const [view, setView] = useState('both');
  const isEnhanced = article.rewritten_content && article.rewritten_content.trim().length > 0;
  const cleanContent = (content) => {
    if (!content) return 'No content available';
  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]*>/g, '') 
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  };
  const originalContent = cleanContent(article.original_content);
  const enhancedContent = cleanContent(article.rewritten_content);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{article.title}</h2>
            <p className="modal-meta">
              Published: {article.published_at 
                ? new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : "Date unknown"}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {isEnhanced && (
          <div className="view-toggle">
            <button 
              className={view === 'both' ? 'active' : ''}
              onClick={() => setView('both')} >
              Side by Side
            </button>
            <button 
              className={view === 'original' ? 'active' : ''}
              onClick={() => setView('original')}>
              Original Only
            </button>
            <button 
              className={view === 'enhanced' ? 'active' : ''}
              onClick={() => setView('enhanced')} >
              Enhanced Only
            </button>
          </div>
        )}
        <div className="modal-content">
          {!isEnhanced ? (
            <div className="content-section">
              <h3 className="section-header">Original Article</h3>
              <div className="content-text">
                {originalContent}
              </div>
            </div>
          ) : (
            <>
              {(view === 'both' || view === 'original') && (
                <div className={`content-section ${view === 'both' ? 'split' : ''}`}>
                  <h3 className="section-header original-header">Original Content</h3>
                  <div className="content-text original-content">
                    {originalContent}
                  </div>
                </div>
              )}
              {(view === 'both' || view === 'enhanced') && (
                <div className={`content-section ${view === 'both' ? 'split' : ''}`}>
                  <h3 className="section-header enhanced-header">Enhanced Content</h3>
                  <div className="content-text enhanced-content">
                    {enhancedContent}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {article.url && (
          <div className="modal-footer">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="source-link">
              View Original Source →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;