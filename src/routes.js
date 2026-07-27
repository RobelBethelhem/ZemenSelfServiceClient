import { element } from 'prop-types'
import React from 'react'

import PrivateRoute from './privateRoute'
import { roles } from './views/admin/System_User_Management/fetchedRole'

const Dashboard = React.lazy(() => import('./views/admin/dashbord/dashbord'))

// admin
const Candidate = React.lazy(() => import('./views/admin/Candidate/candidate'));
const Vote = React.lazy(()=> import('./views/admin/Vote/vote'));
const VoteStastics = React.lazy(()=> import('./views/admin/Vote_Stastics/vote_stastics'));
const Game = React.lazy(()=> import('./views/admin/Game/game'));
const Dashborad = React.lazy(()=> import('./views/admin/dashbord/dashbord'));
const Chat = React.lazy(()=> import('./views/admin/Chat/chat'));

//Serve service Request Form
const ExperienceLetter = React.lazy(()=> import('./views/admin/Experiance_Letter/Experiance_Letter'));
const LetterOfEmbassy = React.lazy(()=> import('./views/admin/Letter_Of_Embassy/Letter_Of_Embassy'));
const GuarantyLetter = React.lazy(()=> import('./views/admin/Guaranty_Letter/Guaranty_Letter'));
const SupportiveLetter = React.lazy(()=> import('./views/admin/Supportive_Letter/SupportiveLetterEnglish'))
const SupportiveLetterAmharic = React.lazy(()=> import('./views/admin/Supportive_Letter/SupportiveLetterAmharic'))
const SupportiveAmharic = React.lazy(()=> import('./views/admin/Letters/Supportive_Amharic_v1'))
const Approval = React.lazy(()=> import("./views/admin/Approval/approval"));
const MedicalLetter = React.lazy(()=> import('./views/admin/Letters/Medical'));

const Supportive = React.lazy(()=> import('./views/admin/Letters/Supportive'))
const Medical = React.lazy(()=> import('./views/admin/Medical/MedicalLetter'))
const Guaranty = React.lazy(()=> import('./views/admin/Letters/Guarenty'))
const Experiance = React.lazy(()=> import('./views/admin/Letters/Experiance'));
const Embassy = React.lazy(()=> import('./views/admin/Letters/Embassy'));
const BingoGame = React.lazy(()=> import('./views/admin/BingoGame/Bingo_Game_Mobile'));

const BingoTv = React.lazy(()=> import('./views/admin/BingoTv/BingoTv'));
const GoldDiggerGame = React.lazy(()=> import('./views/admin/GoldDiggerGame/GoldDiggerGame'));
const GoldDiggerMulGame = React.lazy(()=> import('./views/admin/GoldDiggerMulGame/GoldDiggerMulGame'));
const NotificationSettings = React.lazy(()=> import('./views/NotificationSettings'));

const System_User_Management = React.lazy(() => import('./views/admin/System_User_Management/systemUserManagement'))
const MedicalProvider = React.lazy(() => import('./views/admin/MedicalProvider/MedicalProvider'));

// Salary Increment & Bonus — independent module (does not share code with other letters).
const SalaryIncrementImport = React.lazy(() => import('./views/admin/SalaryIncrement/SalaryIncrementImport'));
const SalaryIncrementUserPage = React.lazy(() => import('./views/admin/SalaryIncrement/SalaryIncrementUserPage'));
const SalaryIncrementList = React.lazy(() => import('./views/admin/SalaryIncrement/SalaryIncrementList'));
const SalaryIncrementPeriod = React.lazy(() => import('./views/admin/SalaryIncrement/SalaryIncrementPeriod'));
const SalaryIncrementAnalytics = React.lazy(() => import('./views/admin/SalaryIncrement/SalaryIncrementAnalytics'));

// --- Service rating (survey gate on letter print/download) -----------------
const ServiceRatingDashboard = React.lazy(() => import('./views/admin/ServiceRating/ServiceRatingDashboard'));
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Chat', element: Chat },

  // admin component
  {
    path: '/admin/employee',
    name: 'Employee',
    element: System_User_Management,
    roles: ['admin']
  },
  {
    path: '/settings/notifications',
    name: 'Notification Settings',
    element: NotificationSettings,
    roles: ['admin', 'user']
  }, // <-- ADDED MISSING COMMA HERE
  {
    path: '/admin/medical-providers',
    name: 'Medical Providers',
    element: MedicalProvider,
    roles: ['admin']
  },
  {
    path: '/admin/golddigger',
    name: 'GoldDigger',
    element: GoldDiggerGame,
    roles: ['admin']
  },

  {
    path: '/user/medical',
    name: 'Medical',
    element: Medical,
    roles: ['admin', 'user']
  },
  {
    path: '/admin/golddiggermul',
    name: 'GoldDiggerMul',
    element: GoldDiggerMulGame,
    roles: ['admin']
  },
  {
    path: '/admin/bingotv',
    name: 'BingoTv',
    element: BingoTv,
    roles: ['admin']
  },
  {
    path: '/admin/bingo',
    name: 'Bingo',
    element: BingoGame,
    roles: ['admin', 'user']
  },
  {
     path: '/admin/supportive',
    name: 'Supportive',
    element: Supportive,
    roles: ['admin', 'user']
  },
  {
    path: '/admin/experiance',
   name: 'Experiance',
   element: Experiance,
   roles: ['admin', 'user']
 },

  {
    path: '/admin/embassy',
   name: 'Embassy',
   element: Embassy,
   roles: ['admin', 'user']
 },


  {
    path: '/admin/guaranty',
   name: 'Guaranty',
   element: Guaranty,
   roles: ['admin', 'user']
 },
  {
    path: '/admin/approval',
    name: 'Approval',
    element: Approval,
    roles: ['admin']
  },
  {
    path: '/user/experiance',
    name: 'Experiance',
    element: ExperienceLetter,
    roles: ['admin', 'user']
  },
  {
    path: '/user/embassy',
    name: 'Embassy',
    element: LetterOfEmbassy,
    roles: ['admin', 'user']
  },
  {
    path: '/user/guaranty',
    name: 'Guaranty',
    element: GuarantyLetter,
    roles: ['admin', 'user']
  },
  {
    path: '/user/supportive',
    name: 'Supportive',
    element: SupportiveLetter,
    roles: ['admin', 'user']
  },

  {
    path: '/admin/supportive-am',
   name: 'SupportiveAmharic',
   element: SupportiveAmharic,
   roles: ['admin', 'user']
   
 },

   {
    path: '/user/supportive-am',
    name: 'SupportiveAmharic',
    element: SupportiveLetterAmharic,
    roles: ['admin', 'user']
  },


  {
    path: '/admin/candidate',
    name: 'Candidate',
    element: Candidate,
    roles: ['admin', 'user']
  },
  {
    path: '/admin/vote',
    name: 'Vote',
    element: Vote,
    roles: ['admin','user']
  },
  {
    path: '/admin/vote_stastics',
    name: 'VoteStastics',
    element: VoteStastics,
    roles: ['admin']
  },
  {
    path: '/admin/Game',
    name: 'Game',
    element: Game,
    roles: ['admin','user']
  },

  {
    path: '/admin/medical',
    name: 'MedicalLetter',
    element: MedicalLetter,
    roles: ['admin','user']
  },

  {
    path: '/admin/dashboard',
    name: 'Dashborad',
    element: Dashborad,
    roles: ['admin']
  },
  {
    path: '/admin/chat',
    name: 'Chat',
    element: Chat,
    roles: ['admin']
  },

  // ============================================================
  // Salary Increment & Bonus — additive, independent route.
  // Removing the two SalaryIncrement entries above and below restores
  // the previous behavior 1:1.
  // ============================================================
  {
    path: '/admin/salary-increment/import',
    name: 'SalaryIncrementImport',
    element: SalaryIncrementImport,
    roles: ['admin']
  },
  {
    path: '/user/salary-increment',
    name: 'SalaryIncrementUser',
    element: SalaryIncrementUserPage,
    roles: ['admin', 'user']
  },
  {
    path: '/admin/salary-increment/list',
    name: 'SalaryIncrementList',
    element: SalaryIncrementList,
    roles: ['admin']
  },
  {
    path: '/admin/salary-increment/period',
    name: 'SalaryIncrementPeriod',
    element: SalaryIncrementPeriod,
    roles: ['admin']
  },
  {
    path: '/admin/salary-increment/analytics',
    name: 'SalaryIncrementAnalytics',
    element: SalaryIncrementAnalytics,
    roles: ['admin']
  },

  // --- Service rating ------------------------------------------------------
  {
    path: '/admin/service-rating',
    name: 'ServiceRating',
    element: ServiceRatingDashboard,
    roles: ['admin']
  },
]

export default routes
