import React from 'react'
import AddPlanJourneyImage from './views/PlanJourneyImage/AddPlanJourneyImage'
import AllPlanJourneyImage from './views/PlanJourneyImage/AllPlanJourneyImage'
import AddAboutImage from './views/AboutImage/AddAboutImage'
import AllAboutImage from './views/AboutImage/AllAboutImage'
import AllTestimonial from './views/Testimonial/AllTestimonial'
import AddTestimonial from './views/Testimonial/AddTestimonial'
import EditTestimonial from './views/Testimonial/EditTestimonial'
import AllBlogs from './views/Blogs/AllBlogs'
import AddBlogs from './views/Blogs/AddBlogs'
import EditBlogs from './views/Blogs/EditBlogs'
import AllUser from './views/User/AllUser'
import AllChatRoom from './views/ChatRoom/AllChatRoom'
import AllProvider from './views/Provider/AllProvider'
import AllWithdraw from './views/Withdraw/AllWithdraw'
import ProviderDetails from './views/Provider/ProviderDetails'
import AllMembership from './views/Membership/AllMembership'
import AddMembership from './views/Membership/AddMembership'
import EditMembership from './views/Membership/EditMembership'
import EditGlobelDisPer from './views/GlobelDisPer/EditGlobelDisPer'
import AllAdminCoupon from './views/AdminCoupon/AllAdminCoupon'
import AddAdminCoupon from './views/AdminCoupon/AddAdminCoupon'
import EditAdminCoupon from './views/AdminCoupon/EditAdminCoupon'
import AllNewsLetter from './views/NewsLetter/AllNewsLetter'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const AddBanner = React.lazy(() => import('./views/Banner/AddBanner'))
const ALLBanner = React.lazy(() => import('./views/Banner/AllBanner'))
// const EditBanner = React.lazy(() => import('./views/Banner/EditBanner'))

const AddWorkDescriptionImage = React.lazy(() => import('./views/WorkDescriptionImage/AddWorkDescriptionImage'))
const AllWorkDescriptionImage = React.lazy(() => import('./views/WorkDescriptionImage/AllWorkDescriptionImage'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/provider/:id', name: 'Provider Detail', element: ProviderDetails },

  { path: '/widgets', name: 'Widgets', element: Widgets },




  // custom code 

  // banner routes here 
  { path: '/banner', name: 'Banner', element: Cards, exact: true },
  { path: '/banner/add-banner', name: 'Add Banner', element: AddBanner },
  { path: '/banner/all-banner', name: 'All Banner', element: ALLBanner },

  // work description routes here 
  { path: '/work_description_image', name: 'Work Description Image', element: Cards, exact: true },
  { path: '/work_description_image/add_work_description_image', name: 'Add Work Description Image', element: AddWorkDescriptionImage },
  { path: '/work_description_image/all_work_description_image', name: 'All Banner', element: AllWorkDescriptionImage },

  // plan journey routes here 
  { path: '/plan_journey_image', name: 'Plan Journey Image', element: Cards, exact: true },
  { path: '/plan_journey_image/add_plan_journey_image', name: 'Add Plan Journey Image', element: AddPlanJourneyImage },
  { path: '/plan_journey_image/all_plan_journey_image', name: 'All Plan Journey Image', element: AllPlanJourneyImage },

  // about image routes here 
  { path: '/about_image', name: 'Plan Journey Image', element: Cards, exact: true },
  { path: '/about_image/add_about_image', name: 'Add About Image', element: AddAboutImage },
  { path: '/about_image/all_about_image', name: 'All About Image', element: AllAboutImage },

  // testimonial routes here 
  { path: '/testimonial', name: 'Testimonial', element: Cards, exact: true },
  { path: '/testimonial/add_testimonial', name: 'Add Testimonial', element: AddTestimonial },
  { path: '/testimonial/all_testimonial', name: 'All Testimonial', element: AllTestimonial },
  { path: '/testimonial/edit_testimonial/:id', name: 'Edit Testimonial', element: EditTestimonial },

  // blogs routes here 
  { path: '/blogs', name: 'Blogs', element: Cards, exact: true },
  { path: '/blogs/add_blogs', name: 'Add Blogs', element: AddBlogs },
  { path: '/blogs/all_blogs', name: 'All Blogs', element: AllBlogs },
  { path: '/blogs/edit_blogs/:id', name: 'Edit Blogs', element: EditBlogs },

  // blogs routes here 
  { path: '/user', name: 'Blogs', element: Cards, exact: true },
  // { path: '/user/add_user', name: 'Add Blogs', element: AddBlogs },
  { path: '/user/all_user', name: 'All Users', element: AllUser },
  // { path: '/user/edit_user/:id', name: 'Edit Blogs', element: EditBlogs },

  // chat routes here 
  { path: '/chats', name: 'Chats', element: Cards, exact: true },
  // { path: '/blogs/add_blogs', name: 'Add Blogs', element: AddBlogs },
  { path: '/chats/all_chat', name: 'All Chats', element: AllChatRoom },
  // { path: '/blogs/edit_blogs/:id', name: 'Edit Blogs', element: EditBlogs },

  // provider routes here 
  { path: '/provider', name: 'Provider', element: Cards, exact: true },
  // { path: '/blogs/add_blogs', name: 'Add Blogs', element: AddBlogs },
  { path: '/provider/all_provider', name: 'All Provider', element: AllProvider },
  // { path: '/blogs/edit_blogs/:id', name: 'Edit Blogs', element: EditBlogs },

  // withdraw routes here 
  { path: '/withdraw', name: 'Withdraw Request', element: Cards, exact: true },
  { path: '/withdraw/all_withdraw', name: 'All Withdraw Request', element: AllWithdraw },

  // membership routes here 
  { path: '/membership', name: 'Membership', element: Cards, exact: true },
  { path: '/membership/all_membership', name: 'All Membership', element: AllMembership },
  { path: '/membership/add_membership', name: 'Add Membership', element: AddMembership },
  { path: '/membership/edit_membership/:id', name: 'Edit Membership', element: EditMembership },
  
  // globel dis route here 
  
  { path: '/globel-ref-dis', name: 'Globel Referal Discount', element: Cards, exact: true },
  { path: '/globel-ref-dis/update-globel-ref-dis', name: 'Edit Globel Referal Discount', element: EditGlobelDisPer },
  
  // globel dis route here 
  
  { path: '/admin-coupon', name: 'Admin Coupon', element: Cards, exact: true },
  { path: '/admin-coupon/all_admin_coupon', name: 'All Admin Coupon', element: AllAdminCoupon },
  { path: '/admin-coupon/add_admin_coupon', name: 'Add Admin Coupon', element: AddAdminCoupon },
  { path: '/admin-coupon/edit_admin_coupon/:id', name: 'Edit Admin Coupon', element: EditAdminCoupon },

  // newsletter routes here 
  { path: '/newsletter', name: 'Newsletter', element: Cards, exact: true },
  { path: '/newsletter/all_newsletter', name: 'All Newsletter', element: AllNewsLetter},
]

export default routes