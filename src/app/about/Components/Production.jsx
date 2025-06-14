import React from 'react';
import ProfileCard from './ProfileCard'

const Production = () => {
 return (
  <ProfileCard
  
  name="Reza Hafiz"
  title="UI&UX Designer"
  handle="Reza"
  status="TEAM"
  contactText="Contact Me"
  avatarUrl="images/rez.png"
  
  showUserInfo={true}
  enableTilt={true}
  onContactClick={() => console.log('Contact clicked')}
/>
  );
};

export default Production;