import axios from 'axios'
import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom';
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiPackage, FiFilter, FiTag, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import ProductEditModal from '../components/ProductEditModal'

// Helper function to get start/end of current and previous month
const getDateRanges = () => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    currentMonthStart,
    prevMonthStart,
    prevMonthEnd
  };
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editProduct, setEditProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalProductsChange: 0,
    categories: 0,
    newCategories: 0,
    onDiscount: 0,
    discountChange: 0,
    avgPrice: 0,
    priceChange: 0
  })

  const fetchList = async () => {
    try {
      setLoading(true);
      
      // Fetch products and statistics in parallel
      const [productsRes, statsRes] = await Promise.all([
        axios.get(backendUrl + '/api/product/list'),
        axios.get(backendUrl + '/api/product/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (productsRes.data.success) {
        const products = productsRes.data.products;
        setList(products.reverse());
        
        // If we have stats from the backend, use them
        if (statsRes.data?.success && statsRes.data.stats) {
          const stats = statsRes.data.stats;
          setStats({
            totalProducts: stats.totalProducts,
            totalProductsChange: stats.totalProductsChange,
            categories: stats.categories,
            newCategories: stats.newCategories,
            onDiscount: stats.onDiscount,
            discountChange: stats.discountChange,
            avgPrice: stats.avgPrice,
            priceChange: stats.priceChange
          });
        } else {
          // Fallback to client-side calculation if backend stats fail
          calculateClientSideStats(products);
        }
      } else {
        toast.error(productsRes.data.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // If we have products but stats failed, try client-side calculation
      if (list.length > 0) {
        calculateClientSideStats(list);
      } else {
        toast.error(error.response?.data?.message || 'Error loading product data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback function to calculate stats client-side if backend fails
  const calculateClientSideStats = (products) => {
    try {
      const { currentMonthStart, prevMonthStart } = getDateRanges();
      
      // Filter products for current and previous month
      const currentMonthProducts = products.filter(p => 
        new Date(p.createdAt) >= currentMonthStart
      );
      
      const prevMonthProducts = products.filter(p => {
        const date = new Date(p.createdAt);
        return date >= prevMonthStart && date < currentMonthStart;
      });

      // Calculate categories
      const categories = new Set(products.map(p => p.category));
      const currentMonthCategories = new Set(
        currentMonthProducts.map(p => p.category)
      );
      
      const prevMonthCategories = new Set(
        prevMonthProducts.map(p => p.category)
      );

      // New categories this month (not in previous months)
      const newCategories = Array.from(currentMonthCategories).filter(
        cat => !prevMonthCategories.has(cat)
      ).length;

      // Calculate discount stats
      const onDiscount = products.filter(p => p.discount > 0).length;
      const prevOnDiscount = prevMonthProducts.filter(p => p.discount > 0).length;
      const discountChange = prevOnDiscount > 0 
        ? Math.round(((onDiscount - prevOnDiscount) / prevOnDiscount) * 100) 
        : 0;

      // Calculate average price
      const avgPrice = products.length > 0 
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
        : 0;
        
      const prevAvgPrice = prevMonthProducts.length > 0
        ? prevMonthProducts.reduce((sum, p) => sum + p.price, 0) / prevMonthProducts.length
        : 0;
        
      const priceChange = prevAvgPrice > 0 
        ? Math.round(((avgPrice - prevAvgPrice) / prevAvgPrice) * 100)
        : 0;

      setStats({
        totalProducts: products.length,
        totalProductsChange: prevMonthProducts.length > 0
          ? Math.round(((products.length - prevMonthProducts.length) / prevMonthProducts.length) * 100)
          : 100,
        categories: categories.size,
        newCategories,
        onDiscount,
        discountChange,
        avgPrice,
        priceChange
      });
    } catch (error) {
      console.error('Error calculating client-side stats:', error);
      toast.error('Error calculating statistics');
    }
  };

  const removeProduct = async (id) => {
    if (!id) {
      toast.error('Product ID is missing');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/product/remove`,
          { id },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'token': token 
            } 
          }
        );
        
        if (response.data.success) {
          toast.success(response.data.message || 'Product deleted successfully');
          await fetchList();
        } else {
          toast.error(response.data.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error deleting product';
        toast.error(errorMessage);
      }
    }
  }

  const handleEditSave = async (updated) => {
    try {
      const formData = new FormData();
      formData.append('id', editProduct._id);
      
      // Handle all form fields
      Object.entries(updated).forEach(([key, value]) => {
        if (key === 'sizes') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'images') {
          // Handle image files separately
          value.forEach((file, index) => {
            if (file) {
              formData.append(`image${index + 1}`, file);
            }
          });
        } else if (key !== 'stock') { // Skip stock field
          formData.append(key, value);
        }
      });
      const response = await axios.post(backendUrl + '/api/product/update', formData, { headers: { token } });
      if (response.data.success) {
        toast.success('Product updated successfully');
        setEditProduct(null);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  // Format price with currency
  const formatPrice = (price) => {
    if (isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('₹', currency);
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Products</h2>
          <p className='text-sm text-gray-500 mt-1'>Manage your product inventory</p>
        </div>
        <Link
          to='/add'
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {/* Total Products Card */}
        <div className='bg-white p-5 rounded-lg shadow border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Total Products</p>
              <p className='mt-1 text-2xl font-semibold text-gray-900'>
                {loading ? '...' : stats.totalProducts}
              </p>
              <p className='mt-1 text-xs text-gray-500 flex items-center'>
                {!loading && (
                  <>
                    {stats.totalProductsChange >= 0 ? (
                      <FiTrendingUp className='text-green-500 mr-1' />
                    ) : (
                      <FiTrendingDown className='text-red-500 mr-1' />
                    )}
                    <span className={stats.totalProductsChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(stats.totalProductsChange)}%
                    </span>
                    {' '}from last month
                  </>
                )}
              </p>
            </div>
            <div className='p-3 rounded-full bg-blue-50'>
              <FiPackage className='h-6 w-6 text-blue-600' />
            </div>
          </div>
        </div>

        {/* Categories Card */}
        <div className='bg-white p-5 rounded-lg shadow border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Categories</p>
              <p className='mt-1 text-2xl font-semibold text-gray-900'>
                {loading ? '...' : stats.categories}
              </p>
              <p className='mt-1 text-xs text-gray-500'>
                {!loading && stats.newCategories > 0 && (
                  <span className='text-green-600 font-medium'>+{stats.newCategories} new</span>
                )}
                {!loading && stats.newCategories === 0 && 'No new categories'}
                {!loading && ' this month'}
              </p>
            </div>
            <div className='p-3 rounded-full bg-green-50'>
              <FiFilter className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </div>

        {/* On Discount Card */}
        <div className='bg-white p-5 rounded-lg shadow border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>On Discount</p>
              <p className='mt-1 text-2xl font-semibold text-gray-900'>
                {loading ? '...' : stats.onDiscount}
              </p>
              <p className='mt-1 text-xs text-gray-500 flex items-center'>
                {!loading && (
                  <>
                    {stats.discountChange >= 0 ? (
                      <FiTrendingUp className='text-green-500 mr-1' />
                    ) : (
                      <FiTrendingDown className='text-red-500 mr-1' />
                    )}
                    <span className={stats.discountChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(stats.discountChange)}%
                    </span>
                    {' '}from last month
                  </>
                )}
              </p>
            </div>
            <div className='p-3 rounded-full bg-yellow-50'>
              <FiTag className='h-6 w-6 text-yellow-600' />
            </div>
          </div>
        </div>

        {/* Average Price Card */}
        <div className='bg-white p-5 rounded-lg shadow border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Avg. Price</p>
              <p className='mt-1 text-2xl font-semibold text-gray-900'>
                {loading ? '...' : (stats.avgPrice > 0 ? formatPrice(stats.avgPrice) : currency + '0')}
              </p>
              <p className='mt-1 text-xs text-gray-500 flex items-center'>
                {!loading && (
                  <>
                    {stats.priceChange >= 0 ? (
                      <FiTrendingUp className='text-green-500 mr-1' />
                    ) : (
                      <FiTrendingDown className='text-red-500 mr-1' />
                    )}
                    <span className={stats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(stats.priceChange)}%
                    </span>
                    {' '}from last month
                  </>
                )}
              </p>
            </div>
            <div className='p-3 rounded-full bg-purple-50'>
              <FiDollarSign className='h-6 w-6 text-purple-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className='bg-white shadow overflow-hidden rounded-lg border border-gray-200'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Product
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell'>
                  Category
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Price
                </th>
                <th scope='col' className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={index} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <img 
                            className='h-10 w-10 rounded-md object-cover' 
                            src={item.image?.[0] || 'https://via.placeholder.com/50'} 
                            alt={item.name} 
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{item.name}</div>
                          <div className='text-xs text-gray-500 md:hidden'>{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap hidden md:table-cell'>
                      <div className='text-sm text-gray-900'>{item.category}</div>
                      <div className='text-xs text-gray-500'>{item.subCategory}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {item.discount > 0 ? (
                        <div className='flex items-center'>
                          <span className='text-sm font-medium text-gray-500 line-through mr-2'>
                            {formatPrice(item.price)}
                          </span>
                          <span className='text-sm font-medium text-green-600'>
                            {formatPrice(item.price * (1 - item.discount / 100))}
                          </span>
                          <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                            {item.discount}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className='text-sm font-medium text-gray-900'>
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-3'>
                        <button
                          onClick={() => setEditProduct(item)}
                          className='text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-1.5 rounded-md transition-colors'
                          title='Edit'
                        >
                          <FiEdit2 className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => removeProduct(item._id)}
                          className='text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-md transition-colors'
                          title='Delete'
                        >
                          <FiTrash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='4' className='px-6 py-12 text-center text-sm text-gray-500'>
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => {}}
              disabled={true}
              className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>
            <button
              onClick={() => {}}
              disabled={true}
              className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing <span className='font-medium'>1</span> to <span className='font-medium'>{list.length}</span> of{' '}
                <span className='font-medium'>{list.length}</span> results
              </p>
            </div>
            <div>
              <nav className='relative z-0 inline-flex -space-x-px rounded-md shadow-sm' aria-label='Pagination'>
                <button
                  onClick={() => {}}
                  disabled={true}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <span className='sr-only'>Previous</span>
                  <svg className='h-5 w-5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
                    <path fillRule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                </button>
                <button
                  onClick={() => {}}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-indigo-600 hover:bg-indigo-50'
                >
                  1
                </button>
                <button
                  onClick={() => {}}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
                >
                  2
                </button>
                <button
                  onClick={() => {}}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
                >
                  3
                </button>
                <button
                  onClick={() => {}}
                  disabled={true}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <span className='sr-only'>Next</span>
                  <svg className='h-5 w-5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
                    <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    {editProduct && (
      <ProductEditModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleEditSave}
      />
    )}
  </div>
  )
}

export default List