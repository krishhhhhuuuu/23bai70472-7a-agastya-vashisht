import './ProfileCard.css'

export default function ProfileCard() {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-image">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Profile"
          />
        </div>
      </div>
      
      <div className="profile-content">
        <h2 className="profile-name">John Doe</h2>
        <p className="profile-title">Full Stack Developer</p>
        
        <p className="profile-bio">
          Passionate about building beautiful and functional web applications. Coffee enthusiast and open source contributor.
        </p>
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">50+</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat">
            <span className="stat-value">100</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value">4</span>
            <span className="stat-label">Years Exp</span>
          </div>
        </div>
        
        <div className="profile-skills">
          <span className="skill">React</span>
          <span className="skill">Node.js</span>
          <span className="skill">JavaScript</span>
          <span className="skill">CSS</span>
        </div>
        
        <div className="profile-actions">
          <button className="btn btn-primary">Follow</button>
          <button className="btn btn-secondary">Message</button>
        </div>
      </div>
    </div>
  )
}
