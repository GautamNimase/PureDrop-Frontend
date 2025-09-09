import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';

const IndiaMapVisualization = () => {
  // Sample dummy data for countries worldwide
  const countryData = [
    // High Performance Countries (Lime Green/Yellow)
    { name: 'United States', reviews: 125000, revenue: 8500000, rating: 'high' },
    { name: 'Canada', reviews: 45000, revenue: 3200000, rating: 'high' },
    { name: 'China', reviews: 98000, revenue: 6800000, rating: 'high' },
    { name: 'India', reviews: 75000, revenue: 5200000, rating: 'high' },
    { name: 'Pakistan', reviews: 12000, revenue: 850000, rating: 'high' },
    { name: 'Afghanistan', reviews: 8500, revenue: 600000, rating: 'high' },
    { name: 'Iran', reviews: 15000, revenue: 1100000, rating: 'high' },
    { name: 'Iraq', reviews: 11000, revenue: 780000, rating: 'high' },
    { name: 'Saudi Arabia', reviews: 18000, revenue: 1300000, rating: 'high' },
    
    // Medium Performance Countries (Light Teal/Mint Green)
    { name: 'Brazil', reviews: 25000, revenue: 1800000, rating: 'medium' },
    { name: 'Finland', reviews: 8500, revenue: 600000, rating: 'medium' },
    { name: 'Ukraine', reviews: 12000, revenue: 850000, rating: 'medium' },
    { name: 'Belarus', reviews: 6500, revenue: 450000, rating: 'medium' },
    { name: 'Sudan', reviews: 4200, revenue: 300000, rating: 'medium' },
    { name: 'Kazakhstan', reviews: 7800, revenue: 550000, rating: 'medium' },
    { name: 'Mongolia', reviews: 3200, revenue: 220000, rating: 'medium' },
    { name: 'Indonesia', reviews: 18000, revenue: 1300000, rating: 'medium' },
    { name: 'Australia', reviews: 22000, revenue: 1600000, rating: 'medium' },
    
    // Low Performance Countries (Grey) - All others
    { name: 'Mexico', reviews: 8500, revenue: 600000, rating: 'low' },
    { name: 'United Kingdom', reviews: 15000, revenue: 1100000, rating: 'low' },
    { name: 'France', reviews: 12000, revenue: 850000, rating: 'low' },
    { name: 'Germany', reviews: 18000, revenue: 1300000, rating: 'low' },
    { name: 'Spain', reviews: 9500, revenue: 680000, rating: 'low' },
    { name: 'Italy', reviews: 11000, revenue: 780000, rating: 'low' },
    { name: 'Japan', reviews: 16000, revenue: 1150000, rating: 'low' },
    { name: 'South Korea', reviews: 8500, revenue: 600000, rating: 'low' },
    { name: 'Russia', reviews: 12000, revenue: 850000, rating: 'low' },
    { name: 'Turkey', reviews: 7800, revenue: 550000, rating: 'low' },
    { name: 'Egypt', reviews: 6500, revenue: 450000, rating: 'low' },
    { name: 'South Africa', reviews: 4200, revenue: 300000, rating: 'low' },
    { name: 'Nigeria', reviews: 3200, revenue: 220000, rating: 'low' },
    { name: 'Argentina', reviews: 2800, revenue: 200000, rating: 'low' },
    { name: 'Chile', reviews: 1800, revenue: 130000, rating: 'low' }
  ];

  // Color coding function - Modern colors matching the image
  const getCountryColor = (rating) => {
    switch (rating) {
      case 'high': return '#84cc16'; // Lime Green/Yellow
      case 'medium': return '#06b6d4'; // Light Teal/Mint Green
      case 'low': return '#9ca3af'; // Grey
      default: return '#9ca3af'; // Default grey
    }
  };

  // Country name mappings for world atlas variations
  const countryNameMap = {
    'United States of America': 'United States',
    'USA': 'United States',
    'United Kingdom': 'United Kingdom',
    'UK': 'United Kingdom',
    'Great Britain': 'United Kingdom',
    'South Korea': 'South Korea',
    'Republic of Korea': 'South Korea',
    'North Korea': 'North Korea',
    'Democratic People\'s Republic of Korea': 'North Korea',
    'Russia': 'Russia',
    'Russian Federation': 'Russia',
    'Iran': 'Iran',
    'Islamic Republic of Iran': 'Iran',
    'Saudi Arabia': 'Saudi Arabia',
    'Kingdom of Saudi Arabia': 'Saudi Arabia',
    'Egypt': 'Egypt',
    'Arab Republic of Egypt': 'Egypt',
    'South Africa': 'South Africa',
    'Republic of South Africa': 'South Africa',
    'Turkey': 'Turkey',
    'Republic of Turkey': 'Turkey',
    'Brazil': 'Brazil',
    'Federative Republic of Brazil': 'Brazil',
    'Argentina': 'Argentina',
    'Argentine Republic': 'Argentina',
    'Chile': 'Chile',
    'Republic of Chile': 'Chile',
    'Mexico': 'Mexico',
    'United Mexican States': 'Mexico',
    'Canada': 'Canada',
    'China': 'China',
    'People\'s Republic of China': 'China',
    'India': 'India',
    'Republic of India': 'India',
    'Pakistan': 'Pakistan',
    'Islamic Republic of Pakistan': 'Pakistan',
    'Afghanistan': 'Afghanistan',
    'Islamic Emirate of Afghanistan': 'Afghanistan',
    'Iraq': 'Iraq',
    'Republic of Iraq': 'Iraq',
    'Japan': 'Japan',
    'Finland': 'Finland',
    'Republic of Finland': 'Finland',
    'Ukraine': 'Ukraine',
    'Belarus': 'Belarus',
    'Republic of Belarus': 'Belarus',
    'Sudan': 'Sudan',
    'Republic of Sudan': 'Sudan',
    'Kazakhstan': 'Kazakhstan',
    'Republic of Kazakhstan': 'Kazakhstan',
    'Mongolia': 'Mongolia',
    'Indonesia': 'Indonesia',
    'Republic of Indonesia': 'Indonesia',
    'Australia': 'Australia',
    'Commonwealth of Australia': 'Australia',
    'Nigeria': 'Nigeria',
    'Federal Republic of Nigeria': 'Nigeria'
  };

  // Get country data by name
  const getCountryData = (countryName) => {
    if (!countryName || typeof countryName !== 'string') {
      return null;
    }
    
    // First try direct mapping
    const mappedName = countryNameMap[countryName] || countryName;
    
    return countryData.find(country => 
      country.name.toLowerCase() === mappedName.toLowerCase() ||
      country.name.toLowerCase().includes(mappedName.toLowerCase()) ||
      mappedName.toLowerCase().includes(country.name.toLowerCase())
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ countryName, data }) => {
    if (!data) return null;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center mb-2">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: getCountryColor(data.rating) }}
          ></div>
          <span className="text-sm font-semibold text-gray-900">{countryName}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Reviews:</span>
            <span className="text-xs font-medium text-gray-900">{data.reviews.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Revenue:</span>
            <span className="text-xs font-medium text-gray-900">${data.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Performance:</span>
            <span className="text-xs font-medium text-gray-900 capitalize">{data.rating}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Global Performance Analytics</h3>
        <div className="text-sm text-gray-500">
          Total Reviews: {countryData.reduce((sum, country) => sum + country.reviews, 0).toLocaleString()}
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 w-full mb-6">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [78, 22]
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup>
            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties?.NAME || geo.properties?.NAME_LONG || geo.properties?.ADMIN || 'Unknown';
                  const countryInfo = getCountryData(countryName);
                  const fillColor = countryInfo ? getCountryColor(countryInfo.rating) : '#9ca3af';
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: "#ffffff",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: fillColor,
                          stroke: "#ffffff",
                          strokeWidth: 1,
                          outline: "none",
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: "#ffffff",
                          strokeWidth: 1,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#84cc16' }}></div>
            <span className="text-sm font-medium text-gray-900">High Performance</span>
          </div>
          <p className="text-xs text-gray-500">10,000+ Reviews</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#06b6d4' }}></div>
            <span className="text-sm font-medium text-gray-900">Medium Performance</span>
          </div>
          <p className="text-xs text-gray-500">5,000-10,000 Reviews</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#9ca3af' }}></div>
            <span className="text-sm font-medium text-gray-900">Low Performance</span>
          </div>
          <p className="text-xs text-gray-500">Below 5,000 Reviews</p>
        </div>
      </div>

      {/* Top Countries Table */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Top Performing Countries</h4>
        <div className="space-y-2">
          {countryData
            .sort((a, b) => b.reviews - a.reviews)
            .slice(0, 10)
            .map((country, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: getCountryColor(country.rating) }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{country.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{country.reviews.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 ml-2">reviews</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default IndiaMapVisualization;
