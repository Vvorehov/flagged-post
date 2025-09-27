import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

library.add(faPlus, faTimes, faSearch, faTwitter, faFacebook, faInstagram);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
