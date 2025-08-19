import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const Hero = () => {
  return (
    <div className='relative w-full h-screen overflow-hidden'>
      <video
        className='absolute inset-0 w-full h-full object-cover object-center'
        src={assets.herosecvid}
        autoPlay
        loop
        muted
        playsInline
      ></video>
      <div className='absolute inset-0 bg-black bg-opacity-40'></div>
      <div className='relative z-10 flex flex-col items-center justify-start h-full text-center text-white p-4 pt-40'>
        <h1 className='font-serif uppercase text-5xl tracking-widest font-bold sm:text-6xl md:text-7xl lg:text-8xl'>
          VANDIRE
        </h1>
      </div>
    </div>
  )
}

export default Hero
