import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SitemapView } from './SitemapView';
import { CronogramaView } from '../cronograma/CronogramaView';
import { Network, CalendarRange } from 'lucide-react';
import '../../styles/cronograma.css';

export const SiteMapsContainer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam === 'cronograma' ? 'cronograma' : 'sitemap');

  useEffect(() => {
    if (tabParam === 'cronograma' || tabParam === 'sitemap') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="sitemaps-hub-container">
      <div className="sitemaps-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sitemaps-view-switch">
            <button
              className={`sitemaps-switch-btn ${activeTab === 'sitemap' ? 'active' : ''}`}
              onClick={() => handleTabChange('sitemap')}
            >
              <Network size={16} />
              <span>Sitemap</span>
            </button>

            <button
              className={`sitemaps-switch-btn ${activeTab === 'cronograma' ? 'active' : ''}`}
              onClick={() => handleTabChange('cronograma')}
            >
              <CalendarRange size={16} />
              <span>Cronograma</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sitemaps-hub-content">
        {activeTab === 'sitemap' ? <SitemapView /> : <CronogramaView />}
      </div>
    </div>
  );
};
