import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import RegisterForm from './components/RegisterForm';
import CategoryList from './components/categories/CategoryList';
import CategoryForm from './components/categories/CategoryForm';
import BannerList from './components/banners/BannerList';
import BannerForm from './components/banners/BannerForm';
import BannerDetail from './components/banners/BannerDetail';
import TeamList from './components/team/TeamList';
import TeamForm from './components/team/TeamForm';
import { NewsLetterList } from './components/newsletter/NewsLetterList';
import { NewsLetterForm } from './components/newsletter/NewsLetterForm';
import InvestorDeskList from './components/investor/InvestorList';
import InvestorDeskSectionForm from './components/investor/InvestorForm';
import InvestorDeskDocumentForm from './components/investor/InvestorDocForm';
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';
import ProductSections from './components/products/ProductSection';
import SettingsForm from './components/settings/SettingsForm';
import SettingsList from './components/settings/SettingsList';
import PartnerList from './components/partners/PartnerList';
import PartnerForm from './components/partners/PartnerForm';
import HiwList from './components/hiws/HIWList';
import HiwForm from './components/hiws/HIWForm';
import FaqList from './components/faqs/FAQList';
import FaqForm from './components/faqs/FAQForm';
import TeamMemberList from './components/team-members/TeamMemberList';
import TeamMemberForm from './components/team-members/TeamMemberForm';
import FormSubmissionList from './components/form-submissions/FormSubmissionList';
import FormSubmissionForm from './components/form-submissions/FormSubmissionForm';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import JobOpeningList from './components/job-openings/JobOpeningList';
import JobOpeningForm from './components/job-openings/JobOpeningForm';
import StoreLocationList from './components/store-locations/StoreLocationList';
import StoreLocationForm from './components/store-locations/StoreLocationForm';

function App() {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !auth.isAuthenticated ? (
              <LoginForm />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            auth.isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {auth.user?.role === 'admin' && (
            <>
              <Route path="register" element={<RegisterForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="categories/new" element={<CategoryForm />} />
              <Route path="categories/:id/edit" element={<CategoryForm />} />
              <Route path="banners" element={<BannerList />} />
              <Route path="banners/new" element={<BannerForm />} />
              <Route path="banners/:id" element={<BannerDetail />} />
              <Route path="banners/:id/edit" element={<BannerForm />} />
              <Route path="team" element={<TeamList />} />
              <Route path="team/new" element={<TeamForm />} />
              <Route path="team/:id/edit" element={<TeamForm />} />
              <Route path="investor-desk" element={<InvestorDeskList />} />
              <Route path="investor-desk/sections/new" element={<InvestorDeskSectionForm />} />
              <Route path="investor-desk/sections/:id/edit" element={<InvestorDeskSectionForm />} />
              <Route path="investor-desk/sections/:sectionId/documents/new" element={<InvestorDeskDocumentForm />} />
              <Route path="investor-desk/sections/:sectionId/documents/:docId/edit" element={<InvestorDeskDocumentForm />} />
              <Route path="newsletter" element={<NewsLetterList />} />
              <Route path="newsletter/new" element={<NewsLetterForm />} />
              <Route path="newsletter/:id/edit" element={<NewsLetterForm />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="products/:id/sections" element={<ProductSections />} />
              <Route path="settings/edit" element={<SettingsForm />} />
              <Route path="settings" element={<SettingsList />} />

              {/* SwrnaSathi Routes */}
              <Route path="partners" element={<PartnerList />} />
              <Route path="partners/new" element={<PartnerForm />} />
              <Route path="partners/edit/:id" element={<PartnerForm />} />
              <Route path="hiws" element={<HiwList />} />
              <Route path="hiws/new" element={<HiwForm />} />
              <Route path="hiws/edit/:id" element={<HiwForm />} />
              <Route path="faqs" element={<FaqList />} />
              <Route path="faqs/new" element={<FaqForm />} />
              <Route path="faqs/edit/:id" element={<FaqForm />} />
              <Route path="team-members" element={<TeamMemberList />} />
              <Route path="team-members/new" element={<TeamMemberForm />} />
              <Route path="team-members/edit/:id" element={<TeamMemberForm />} />
              <Route path="form-submissions" element={<FormSubmissionList />} />
              <Route path="form-submissions/new" element={<FormSubmissionForm />} />
              <Route path="form-submissions/edit/:id" element={<FormSubmissionForm />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/edit/:id" element={<UserForm />} />
              <Route path="job-openings" element={<JobOpeningList />} />
              <Route path="job-openings/new" element={<JobOpeningForm />} />
              <Route path="job-openings/edit/:id" element={<JobOpeningForm />} />
              <Route path="store-locations" element={<StoreLocationList />} />
              <Route path="store-locations/new" element={<StoreLocationForm />} />
              <Route path="store-locations/edit/:id" element={<StoreLocationForm />} />
            </>
          )}
          <Route
            index
            element={
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
                <p>Select an option from the sidebar to get started.</p>
              </div>
            }
          />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;