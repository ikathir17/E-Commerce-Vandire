import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const Hero = () => {
  return (
    <div className='relative bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden'>
      <div className='max-w-7xl mx-auto'>
        <div className='relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32'>
          <main className='mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20'>
            <div className='sm:text-center lg:text-left'>
              <div className='inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white text-black shadow-sm mb-6'>
                <span className='w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse'></span>
                <span>NEW COLLECTION</span>
              </div>
              <h1 className='text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl'>
                <span className='block xl:inline'>Elevate Your</span>{' '}
                <span className='block text-yellow-600 xl:inline'>Style Game</span>
              </h1>
              <p className='mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0'>
                Discover our latest collection of premium fashion that combines comfort, quality, and style for the modern individual.
              </p>
              <div className='mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start'>
                <div className='rounded-md shadow'>
                  <Link
                    to='/collection'
                    className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10 transition-colors duration-200'
                  >
                    Shop Now
                    <FiArrowRight className='ml-2 -mr-1 w-5 h-5' />
                  </Link>
                </div>
                <div className='mt-3 rounded-md shadow sm:mt-0 sm:ml-3'>
                  <Link
                    to='/about'
                    className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200'
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className='lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2'>
        <img
          className='h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full'
          src={assets.hero_img}
          alt='Fashion model showcasing latest collection'
        />
      </div>
    </div>
  )
}

export default Hero
