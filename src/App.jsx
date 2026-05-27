import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from "./Layout"
import Login from "./Pages/Login"
import Home from "./Pages/Home"
import PassengerManagement from "./Pages/PassengerManagement"
import DriverManagement from "./Pages/DriverManagement"
import RideManagement from "./Pages/RideManagement"
import RideDetails from "./Pages/RideDetails"
import PaymentManagement from "./Pages/PaymentManagement"
import PoolManagement from "./Pages/PoolManagement"
import PoolDetails from "./Pages/PoolDetails"
import PromotedRoutes from "./Pages/PromotedRoutes"
import Offers from "./Pages/Offers"

// Auth Guard Component
const RequireAuth = ({ children }) => {
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/*" element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path='/' element={<Home />} />

                {/* User Management */}
                <Route path='/passengers' element={<PassengerManagement view="directory" />} />
                <Route path='/passengers/history' element={<PassengerManagement view="ride_history" />} />
                <Route path='/passengers/transactions' element={<PassengerManagement view="transactions" />} />

                <Route path='/drivers' element={<DriverManagement view="directory" />} />
                <Route path='/drivers/onboarding' element={<DriverManagement view="onboarding" />} />
                {/* <Route path='/drivers/earnings' element={<DriverManagement view="earnings" />} /> */}
                <Route path='/drivers/complaints' element={<DriverManagement view="complaints" />} />

                {/* Ride Management */}
                <Route path='/rides/live' element={<RideManagement view="live" />} />
                <Route path='/rides/pools' element={<PoolManagement />} />
                <Route path='/rides/promoted' element={<PromotedRoutes />} />
                <Route path='/rides/offers' element={<Offers />} />
                <Route path='/rides/pools/:poolId' element={<PoolDetails />} />
                <Route path='/rides/history' element={<RideManagement view="history" />} />
                <Route path='/rides/disputes' element={<RideManagement view="disputes" />} />
                <Route path='/rides/:rideId' element={<RideDetails />} />

                {/* Payments & Earnings */}
                <Route path='/payments' element={<PaymentManagement view="dashboard" />} />
                <Route path='/payments/wallets/drivers' element={<PaymentManagement view="driver-wallets" />} />
                <Route path='/payments/wallets/passengers' element={<PaymentManagement view="passenger-wallets" />} />
                <Route path='/payments/commissions' element={<PaymentManagement view="commissions" />} />
                <Route path='/payments/transactions' element={<PaymentManagement view="transactions" />} />

              </Routes>
            </Layout>
          </RequireAuth>
        } />
      </Routes>
    </Router>
  )
}

export default App
