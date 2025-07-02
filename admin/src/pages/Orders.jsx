import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  // --- Statistics calculation ---
  const stats = {
    total: orders.length,
    packing: orders.filter(o => o.status === 'Packing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    outForDelivery: orders.filter(o => o.status === 'Out for delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    // Additional metrics
    today: orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length,
    thisWeek: orders.filter(o => {
      const orderDate = new Date(o.date);
      const today = new Date();
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      return orderDate >= firstDayOfWeek;
    }).length,
    totalAmount: orders.reduce((sum, order) => sum + order.amount, 0).toFixed(2),
    averageOrderValue: (orders.reduce((sum, order) => sum + order.amount, 0) / (orders.length || 1)).toFixed(2)
  };

  return (
    <div>
      <h3 className='text-2xl font-bold mb-6'>Order Page</h3>
      {/* --- Statistics Section --- */}
      <div className='mb-8'>
        <h3 className='text-xl font-semibold mb-4 text-gray-700'>Order Analytics</h3>
        
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* Total Orders */}
          <div className='bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Total Orders</p>
                <p className='text-2xl font-bold mt-1'>{stats.total}</p>
                <p className='text-xs text-gray-500 mt-1'>All time</p>
              </div>
              <div className='bg-blue-50 p-3 rounded-full'>
                <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Today's Orders */}
          <div className='bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Today's Orders</p>
                <p className='text-2xl font-bold mt-1'>{stats.today}</p>
                <p className='text-xs text-gray-500 mt-1'>{new Date().toLocaleDateString()}</p>
              </div>
              <div className='bg-green-50 p-3 rounded-full'>
                <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                </svg>
              </div>
            </div>
          </div>

          {/* This Week's Orders */}
          <div className='bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>This Week</p>
                <p className='text-2xl font-bold mt-1'>{stats.thisWeek}</p>
                <p className='text-xs text-gray-500 mt-1'>Weekly total</p>
              </div>
              <div className='bg-purple-50 p-3 rounded-full'>
                <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className='bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Total Revenue</p>
                <p className='text-2xl font-bold mt-1'>{currency}{stats.totalAmount}</p>
                <p className='text-xs text-gray-500 mt-1'>Avg. order: {currency}{stats.averageOrderValue}</p>
              </div>
              <div className='bg-yellow-50 p-3 rounded-full'>
                <svg className='w-6 h-6 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6'>
          {/* Packing */}
          <div className='bg-white rounded-lg border border-yellow-100 p-4 text-center hover:shadow-md transition-shadow'>
            <div className='text-yellow-500 bg-yellow-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'></path>
              </svg>
            </div>
            <p className='text-sm text-gray-500'>Packing</p>
            <p className='text-xl font-semibold'>{stats.packing}</p>
          </div>

          {/* Shipped */}
          <div className='bg-white rounded-lg border border-blue-100 p-4 text-center hover:shadow-md transition-shadow'>
            <div className='text-blue-500 bg-blue-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z'></path>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'></path>
              </svg>
            </div>
            <p className='text-sm text-gray-500'>Shipped</p>
            <p className='text-xl font-semibold'>{stats.shipped}</p>
          </div>

          {/* Out for Delivery */}
          <div className='bg-white rounded-lg border border-purple-100 p-4 text-center hover:shadow-md transition-shadow'>
            <div className='text-purple-500 bg-purple-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
              </svg>
            </div>
            <p className='text-sm text-gray-500'>Out for Delivery</p>
            <p className='text-xl font-semibold'>{stats.outForDelivery}</p>
          </div>

          {/* Delivered */}
          <div className='bg-white rounded-lg border border-green-100 p-4 text-center hover:shadow-md transition-shadow'>
            <div className='text-green-500 bg-green-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
              </svg>
            </div>
            <p className='text-sm text-gray-500'>Delivered</p>
            <p className='text-xl font-semibold'>{stats.delivered}</p>
          </div>

          {/* Cancelled */}
          <div className='bg-white rounded-lg border border-red-100 p-4 text-center hover:shadow-md transition-shadow'>
            <div className='text-red-500 bg-red-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
              </svg>
            </div>
            <p className='text-sm text-gray-500'>Cancelled</p>
            <p className='text-xl font-semibold'>{stats.cancelled}</p>
          </div>

          {/* Delivery Rate */}
          <div className='bg-white rounded-lg border border-indigo-100 p-4 text-center hover:shadow-md transition-shadow'>
            <div className='text-indigo-500 bg-indigo-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'></path>
              </svg>
            </div>
            <p className='text-sm text-gray-500'>Delivery Rate</p>
            <p className='text-xl font-semibold'>
              {stats.total > 0 ? Math.round((stats.delivered / (stats.total - stats.cancelled || 1)) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
      {/* --- Orders List --- */}
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> </p>
                    }
                    else {
                      return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> ,</p>
                    }
                  })}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : { order.payment || order.status === 'Delivered' ? 'Done' : 'Pending' }</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
              <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders