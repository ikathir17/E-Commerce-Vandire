import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FiUpload, FiX, FiPlus, FiImage, FiDollarSign, FiTag, FiAlignLeft, FiCheck, FiGrid } from 'react-icons/fi';

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [price, setPrice] = useState("");
   const [category, setCategory] = useState("Men");
   const [subCategory, setSubCategory] = useState("Topwear");
   const [bestseller, setBestseller] = useState(false);
   const [sizes, setSizes] = useState([]);

   const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))

      image1 && formData.append("image1",image1)
      image2 && formData.append("image2",image2)
      image3 && formData.append("image3",image3)
      image4 && formData.append("image4",image4)

      const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
   }

  return (
    <div className='w-full max-w-5xl mx-auto p-4 sm:p-6'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-100'>
          <h1 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
            <FiPlus className='text-blue-600' /> Add New Product
          </h1>
          <p className='text-sm text-gray-500 mt-1'>Fill in the product details below</p>
        </div>
        
        <form onSubmit={onSubmitHandler} className='p-6 space-y-6'>
          {/* Image Upload Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-gray-700'>
              <FiImage className='w-5 h-5' />
              <h2 className='font-medium'>Product Images</h2>
            </div>
            <p className='text-sm text-gray-500 -mt-2'>Upload up to 4 images (First image will be the main display)</p>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3'>
              {[1, 2, 3, 4].map((num) => {
                const imageState = eval(`image${num}`);
                const setImageState = eval(`setImage${num}`);
                const inputId = `image${num}`;
                
                return (
                  <div key={num} className='relative'>
                    <label 
                      htmlFor={inputId} 
                      className={`block aspect-square w-full border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                        !imageState 
                          ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-blue-300' 
                          : 'border-transparent'
                      }`}
                    >
                      {!imageState ? (
                        <div className='w-full h-full flex flex-col items-center justify-center p-4 text-gray-400'>
                          <FiUpload className='w-6 h-6 mb-2' />
                          <span className='text-xs text-center'>Image {num}</span>
                        </div>
                      ) : (
                        <div className='relative w-full h-full group'>
                          <img 
                            src={URL.createObjectURL(imageState)} 
                            alt={`Preview ${num}`}
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setImageState(false);
                                document.getElementById(inputId).value = '';
                              }}
                              className='opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all transform translate-y-2 group-hover:translate-y-0'
                            >
                              <FiX className='w-3.5 h-3.5' />
                            </button>
                          </div>
                        </div>
                      )}
                      <input 
                        onChange={(e) => setImageState(e.target.files[0])} 
                        type='file' 
                        id={inputId} 
                        accept='image/*' 
                        className='hidden'
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Details Section */}
          <div className='space-y-6 pt-2'>
            <div className='flex items-center gap-2 text-gray-700'>
              <FiTag className='w-5 h-5' />
              <h2 className='font-medium'>Product Information</h2>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>Product Name</label>
                <div className='relative mt-1'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                    <FiTag className='h-4 w-4' />
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150'
                    placeholder='e.g., Cotton T-Shirt'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>Price (₹)</label>
                <div className='relative mt-1'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                    <FiDollarSign className='h-4 w-4' />
                  </div>
                  <input
                    type='number'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150'
                    placeholder='0.00'
                    min='0'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>Category</label>
                <div className='relative mt-1'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                    <FiGrid className='h-4 w-4' />
                  </div>
                  <div className='relative'>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className='block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white'
                    >
                      <option value='Men'>Men</option>
                      <option value='Women'>Women</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>Sub Category</label>
                <div className='relative mt-1'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                    <FiGrid className='h-4 w-4' />
                  </div>
                  <div className='relative'>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className='block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white'
                    >
                      <option value='Topwear'>Topwear</option>
                      <option value='Bottomwear'>Bottomwear</option>
                      <option value='Accessories'>Accessories</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>Description</label>
                <div className='relative mt-1'>
                  <div className='absolute top-3 left-3 text-gray-400'>
                    <FiAlignLeft className='h-4 w-4' />
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows='3'
                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 resize-none'
                    placeholder='Product description...'
                    required
                  />
                </div>
              </div>

              <div className='space-y-3 pt-1'>
                <label className='block text-sm font-medium text-gray-700'>Available Sizes</label>
                <div className='flex flex-wrap gap-2'>
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      type='button'
                      onClick={() => setSizes(prev => 
                        prev.includes(size) 
                          ? prev.filter(item => item !== size) 
                          : [...prev, size]
                      )}
                      className={`inline-flex items-center justify-center w-12 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        sizes.includes(size)
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {sizes.includes(size) && <FiCheck className='w-4 h-4 mr-1' />}
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex items-center pt-6'>
                <div className='flex items-center h-5'>
                  <input
                    id='bestseller'
                    type='checkbox'
                    checked={bestseller}
                    onChange={() => setBestseller(prev => !prev)}
                    className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  />
                </div>
                <label htmlFor='bestseller' className='ml-3 text-sm text-gray-700'>
                  Mark as Bestseller
                </label>
              </div>
            </div>
          </div>

          <div className='pt-4 border-t border-gray-100 flex justify-end'>
            <button
              type='submit'
              className='inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150'
            >
              <FiPlus className='w-4 h-4 mr-2' />
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Add