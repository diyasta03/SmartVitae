import React from 'react';
import ProfileCard from './ProfileCard'

const Creative = () => {
 return (
  <ProfileCard
  
  name="Diyas"
  title="FullStack Devloper"
  handle="Diyastaa"
  status="TEAM"
  contactText="Contact Me"
  avatarUrl="images/diyas.png"
  
  showUserInfo={true}
  enableTilt={true}
  onContactClick={() => console.log('Contact clicked')}
/>
  );
};

export default Creative;