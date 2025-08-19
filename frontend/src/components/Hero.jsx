import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const Hero = () => {
  return (
    <div className='relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden'>
      <video
        className='absolute inset-0 w-full h-full object-cover object-center'
        src={assets.herosecvid}
        autoPlay
        loop
        muted
        playsInline
      ></video>
      <div className='absolute inset-0 bg-black bg-opacity-40'></div>
      <div className='relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4'>
        <div className='inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white shadow-sm mb-6'>
          <span className='w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse'></span>
          <span>NEW COLLECTION</span>
        </div>
        <h1 className='text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl'>
          <span className='block'>Elevate Your</span>
          <span className='block text-yellow-400'>Style Game</span>
        </h1>
        <p className='mt-3 text-base sm:mt-5 sm:text-lg max-w-xl mx-auto md:mt-5 md:text-xl'>
          Discover our latest collection of premium fashion that combines comfort, quality, and style for the modern individual.
        </p>
        <div className='mt-5 sm:mt-8 flex flex-col sm:flex-row sm:justify-center gap-3 w-full max-w-md mx-auto'>
          <Link
            to='/collection'
            className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200'
          >
            Shop Now
            <FiArrowRight className='ml-2 -mr-1 w-5 h-5' />
          </Link>
          <Link
            to='/about'
            className='w-full flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 md:py-4 md:text-lg md:px-10 transition-colors duration-200'
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Hero
