import React, { useState } from 'react';
import { assets } from '../assets/assets';

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(() => ({
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    category: product.category || 'Men',
    subCategory: product.subCategory || 'Topwear',
    bestseller: product.bestseller || false,
    sizes: product.sizes || [],
    discount: product.discount || 0,
  }));
  const [images, setImages] = useState([null, null, null, null]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle form fields
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSizeChange = (size) => {
    setForm((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleImageChange = (idx, file) => {
    setImages((prev) => {
      const newArr = [...prev];
      newArr[idx] = file;
      return newArr;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare the data to be saved
    const dataToSave = {
      ...form,
      images
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <p className='mb-2'>Upload Image</p>
            <div className='flex gap-2'>
              {[0,1,2,3].map(idx => (
                <div key={idx} className='flex flex-col items-center'>
                  <label htmlFor={`image${idx+1}`} className='cursor-pointer'>
                    <img className='w-16 h-16 object-cover' src={images[idx] ? URL.createObjectURL(images[idx]) : (product.image && product.image[idx]) || assets.upload_area} alt='' />
                  </label>
                  <input onChange={e => handleImageChange(idx, e.target.files[0])} type="file" id={`image${idx+1}`} hidden />
                  <button type="button" onClick={() => document.getElementById(`image${idx+1}`).click()} className="mt-1 px-2 py-1 bg-gray-200 rounded text-xs">Choose Image</button>
                </div>
              ))}
            </div>
          </div>
          <label>Product name
            <input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full" required />
          </label>
          <label>Product description
            <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" required />
          </label>
          <label>Product category
            <select name="category" value={form.category} onChange={handleChange} className="border p-2 w-full">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </label>
          <label>Sub category
            <select name="subCategory" value={form.subCategory} onChange={handleChange} className="border p-2 w-full">
              <option value="Topwear">Topwear</option>
              <option value="Bottumwear">Bottumwear</option>
              <option value="Acceseries">Acceseries</option>
            </select>
          </label>
          <label>Product Price
            <input name="price" type="number" value={form.price} onChange={handleChange} className="border p-2 w-full" required />
          </label>
          <label>Product Sizes</label>
          <div className='flex gap-2 flex-wrap mb-2'>
            {['S','M','L','XL','XXL'].map(size => (
              <label key={size} className='flex items-center gap-1'>
                <input type='checkbox' checked={form.sizes.includes(size)} onChange={() => handleSizeChange(size)} /> {size}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input name="bestseller" type="checkbox" checked={form.bestseller} onChange={handleChange} /> Add to bestseller
          </label>
          <label>Discount (%)
            <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} className="border p-2 w-full" />
          </label>
          <button type="submit" className="bg-black text-white py-2 rounded">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
