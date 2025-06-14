  import React, { useEffect, useState } from 'react'
  import CardSVG from './CardSVG'
  import { motion, useScroll, useMotionValueEvent } from "framer-motion"
  import Strategy from './Strategy'
  import Creative from './Creative'
  import Production from './Production'

  const Cards = () => {
    const { scrollYProgress } = useScroll();
    const [scroll, setScroll] = useState(0);
    const [smoothScroll, setSmoothScroll] = useState(0);
    const [smoothScrollSlow, setSmoothScrollSlow] = useState(0);
    const [isFixed, setIsFixed] = useState(false);

    const clockwise_rotation_limit = 16;
    const anticlockwise_rotation_limit = (clockwise_rotation_limit * 25) / 60;
    const flipStartScroll = 2000;

    // Posisi yang lebih seimbang dengan container
    const cardPositions = {
      strategy: '43%',    // Digeser sedikit ke kanan
      creative: '49%',    // Tetap di tengah
      production: '37%'  // Digeser sedikit ke kiri
    };

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
      setSmoothScroll(latest * clockwise_rotation_limit);
      setSmoothScrollSlow(latest * anticlockwise_rotation_limit);
    })

    useEffect(() => {
      const handleScroll = () => {
        const posX = window.scrollY;
        setScroll(posX);
        setIsFixed(posX > 500);
      };
      document.addEventListener("scroll", handleScroll);
      return () => {
        document.removeEventListener("scroll", handleScroll);
      };
    }, []);

    return (
      <div 
        id="card_holder" 
        style={{ 
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)' 
        }} 
        className={`flex justify-center items-center h-screen mt-10 z-1000 ${isFixed ? 'fixed w-full' : 'relative'}`}
      >
        {/* Strategy Card */}
        <motion.div
          style={{
            left: cardPositions.strategy,
            zIndex: 10,
            rotate: -(Math.min(smoothScroll, clockwise_rotation_limit)),
            transformOrigin: scroll < flipStartScroll ? 'bottom right' : 'center center'
          }}
          transition={{ type: "spring", bounce: 0.25 }}
          className="absolute top-0"
          initial={{ x: 0, opacity: 1 }}
          animate={{
            x: smoothScroll < (clockwise_rotation_limit / 5) ? 0 : -smoothScroll * 25, // Diperkecil efek gesernya
            rotateY: scroll >= flipStartScroll ? 180 : 0,
            rotate: scroll >= flipStartScroll ? 0 : -(Math.min(smoothScroll, clockwise_rotation_limit)),
            opacity: 1
          }}
        >
          {scroll >= flipStartScroll ? (<Strategy />) : (<CardSVG />)}
        </motion.div>

        {/* Creative Card */}
        <motion.div
          style={{
            left: cardPositions.creative,
            zIndex: 20,
            rotate: -(Math.min(smoothScrollSlow, anticlockwise_rotation_limit)),
            transformOrigin: scroll < flipStartScroll + 200 ? 'bottom right' : 'center center'
          }}
          transition={{ type: "spring", bounce: 0.25 }}
          className="absolute top-0"
          initial={{ x: 0, opacity: 1 }}
          animate={{
            x: smoothScroll < (clockwise_rotation_limit / 5) ? 0 : -smoothScroll * 8, // Diperkecil efek gesernya
            rotateY: scroll >= flipStartScroll + 200 ? 180 : 0,
            rotate: scroll >= flipStartScroll ? 0 : -(Math.min(smoothScrollSlow, anticlockwise_rotation_limit)),
            opacity: 1
          }}
        >
          {scroll >= flipStartScroll + 200 ? (<Creative />) : (<CardSVG />)}
        </motion.div>

        {/* Production Card */}
        <motion.div 
          id="card-production"
          style={{
            left: cardPositions.production,
            zIndex: 30,
            rotate: Math.min(smoothScroll, clockwise_rotation_limit),
            transformOrigin: scroll < flipStartScroll + 600 ? 'bottom right' : 'center center'
          }}
          transition={{ type: "spring", bounce: 0.25 }}
          className="absolute top-0"
          initial={{ x: 0, opacity: 1 }}
          animate={{
            x: smoothScroll < (clockwise_rotation_limit / 5) ? 0 : smoothScroll * 25, // Diperkecil efek gesernya
            rotateY: scroll >= flipStartScroll + 600 ? 180 : 0,
            rotate: scroll >= flipStartScroll ? 0 : Math.min(smoothScroll, clockwise_rotation_limit),
            opacity: 1,
          }}
        >
          {scroll >= flipStartScroll + 600 ? (<Production />) : (<CardSVG />)}
        </motion.div>
      </div>
    )
  }

  export default Cards