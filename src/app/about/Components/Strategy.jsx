import React from 'react';
import ProfileCard from './ProfileCard'

const StrategyCard = () => {

  
  return (
  <ProfileCard
  
  name="Ahmad Bahrain"
  title="QA Tester & Dokumentasi"
  handle="Bahrain"
  status="TEAM"
  contactText="Contact Me"
  avatarUrl="images/im.png"
  
  showUserInfo={true}
  enableTilt={true}
  onContactClick={() => console.log('Contact clicked')}
/>
  );
};

export default StrategyCard;