import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer, // Dashboard
  cilImage,       // Banner & Images
  cilText,        // Testimonial & Blogs
  cilUser,        // All User
  cilGroup,       // All Provider
  cilChatBubble,  // All Chat
  cilWallet,      // Withdraw Request
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Home Layout',
    to: '#',
    icon: <CIcon icon={cilText} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Banner',
        to: '/banner/all-banner',
      },
      {
        component: CNavItem,
        name: 'Work Description Image',
        to: '/work_description_image/all_work_description_image',
      },
      {
        component: CNavItem,
        name: 'Plan Journey Image',
        to: '/plan_journey_image/all_plan_journey_image',
      },
      {
        component: CNavItem,
        name: 'About Image',
        to: '/about_image/all_about_image',
      },
      {
        component: CNavItem,
        name: 'Testimonial',
        to: '/testimonial/all_testimonial',
      },
      {
        component: CNavItem,
        name: 'Blogs',
        to: '/blogs/all_blogs',
      },
      {
        component: CNavItem,
        name: 'Term & Condition',
        to: '/term/edit_term?type=term',
      },
      {
        component: CNavItem,
        name: 'Privacy & Policy',
        to: '/term/edit_privacy?type=privacy',
      },
      {
        component: CNavItem,
        name: 'Disclaimer',
        to: '/term/edit_disclamier?type=disclamier',
      },
      {
        component: CNavItem,
        name: 'Cancel & Refund',
        to: '/term/edit_refund?type=refund',
      },
      {
        component: CNavItem,
        name: 'All Expertise',
        to: '/expertise/all_expertise',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'All User',
    to: '/user/all_user',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'All Consultant',
    to: '/provider/all_provider',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'All Chat',
    to: '/chats/all_chat',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'All Call',
    to: '/call/all_call',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'All Projects',
    to: '/project/all_project',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Withdraw Request',
    to: '/withdraw/all_withdraw',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Membership',
    to: '/membership/all_membership',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Newsletter',
    to: '/newsletter/all_newsletter',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Commission',
    to: '/commission/edit_commission',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Refferal',
    to: '#',
    icon: <CIcon icon={cilText} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Globel Referal Discount',
        to: '/globel-ref-dis/update-globel-ref-dis',
      },
      {
        component: CNavItem,
        name: 'Admin Coupon',
        to: '/admin-coupon/all_admin_coupon',
      },
    ],
  },
]

export default _nav
