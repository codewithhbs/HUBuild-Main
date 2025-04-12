const express = require('express');
const { registeruser, getAllUsers, getSingleUserById, updateProfile, login, logout, deleteAccount, banUserToggle, verifyEmail, resendOtp, forgotPassword, getUserById, createPayment, PaymentVerify, getSingleUser, updateUserPassword, getTotalRechargeAmount, Changepassword } = require('../controllers/user.Controller');
const { protect } = require('../middlewares/Protect');
const { CreateProvider, GetMyProfile, addPortfolio, getAllProvider, getSingleProvider, updateProvider, updateDocuments, updatePassword, updateAvailable, updateBankDetail, updateIsBanned, deleteprovider, accountVerification, getProviderStatus, sendOtpForUpdateDetail, verifyOtpForUpdateDetail } = require('../controllers/provider.controller');
const multer = require('multer');
const { getAllChat } = require('../controllers/ChatController');
const { createReview, getAllReview, getReviewByProviderId } = require('../controllers/review.Controller');
const { createBanner, getAllBanner, deleteBanner, updateBannerActiveStatus } = require('../controllers/banner.Controller');
const { createDescribeWork, getAllDescribeWork, deleteDescribeWork, updateWorkActiveStatus } = require('../controllers/describeWork.controller');
const { createplanJourneyImage, getAllJourneyImage, deleteJourneyImage, updatePlanActiveStatus } = require('../controllers/planJourneyImage.controller');
const { createAboutImage, getAllAboutImage, deleteAboutImage, updateAboutActiveStatus } = require('../controllers/aboutImage.controller');
const { createTestimonial, getAllTestimonial, getsingleTestimonial, deleteTestimonial, updateTestimonial, updateTestimonialActiveStatus } = require('../controllers/testimonial.controller');
const { createBlog, getAllBlog, getSingleBlog, updateBlog, deleteBlog } = require('../controllers/blog.controller');
const { createBlogComment, getAllComments, getBlogCommentByBlogId, deleteBlogComment } = require('../controllers/blogCommont.controller');
const { createChatWithNew, getAllChatRecord, getChatByProviderid, getChatByUserid, getChatById, markAllChatsAsRead, markUserChatsAsRead, markProviderChatsAsRead, deleteChatRoom, getchatByRoom } = require('../controllers/chatAndPayment.Controller');
const { createWithdrawal, updateWithdrawStatus, deleteWithdrawRequest, getWithdrawalsByProviderId, getAllWithdrawals, getTotalWithdrawAndCommission } = require('../controllers/withdraw.controller');
const { createCommission, updateCommission, getSingleCommission, getAllCommissions, deleteCommission } = require('../controllers/commission.controller');
const { createProviderService, getAllProviderService, getProviderServiceById, updateProviderService, deleteProviderService, findbyProvider } = require('../controllers/providerService.controller');
const { createCall, call_status } = require('../controllers/call.controller');
const { createMemberShip, getAllMemberShip, getSingleMemberShip, updateMemberShip, deleteMemberShip, checkCouponCode, buyMemberShip, membershipPaymentVerify } = require('../controllers/memberShip.controller');
const { createGlobelUserRefDis, getAllGlobelUserRefDis, updateGlobelUserRef, deleteGlobelUserRef, getSingleGlobelUserRef } = require('../controllers/globelUserRefDis.controller');
const { createAdminCoupon, getAllAdminCoupon, getSingleAdminCoupon, updateAdminCoupon, deleteAdminCoupon } = require('../controllers/adminCoupon.controller');
const { createNewsLetter, getAllNewsLetter, deleteNewsLetter, getSingleNewsLetter, sendNewsLetterMessage } = require('../controllers/newsLetter.controller');
const { createExpertise, getAllExpertise, getSingleExpertise, updateExpertise, deleteExpertise } = require('../controllers/expertise.controller');
const { createTerm, getTerm, singleTerm, updateTerm } = require('../controllers/termAndCondition');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();


//User registration related routes
router.post('/register', registeruser);
router.put('/user/update-profile/:id', upload.single('ProfileImage'), updateProfile);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify/:type', verifyEmail);
router.post('/Changepassword', Changepassword);
router.post('/resend-otp/:type', resendOtp);
router.post('/forgot-password', forgotPassword);
router.get('/get-user-by-id/:id', getUserById);
router.put('/update-user-password/:userId', updateUserPassword)
router.get('/total-recharge-amount', getTotalRechargeAmount);

//providers registration related routes
router.post(
    '/register-provider',
    // (req, res, next) => {
    //     upload.fields([
    //         { name: 'adhaarCard', maxCount: 2 },
    //         { name: 'panCard', maxCount: 1 },
    //         { name: 'qualificationProof', maxCount: 1 },
    //         { name: 'photo', maxCount: 1 }

    //     ])(req, res, (err) => {
    //         if (err) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'File upload error',
    //                 error: err.message
    //             });
    //         }
    //         next();
    //     });
    // },
    CreateProvider
);
router.put('/update-provider-documents/:providerId', upload.fields([
    { name: 'adhaarCard', maxCount: 2 },
    { name: 'panCard', maxCount: 1 },
    { name: 'qualificationProof', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), updateDocuments)
router.put('/update-provider-profile/:_id', updateProvider)
router.put('/update-bank-detail/:providerId', updateBankDetail)
router.put('/update-provider-password/:providerId', updatePassword)
router.put('/update-provider-isbanned/:providerId', updateIsBanned)
router.get('/GetMyProfile', protect, GetMyProfile)
router.get('/get-single-provider/:_id', getSingleProvider)
router.post('/addPortfolio', protect, (req, res, next) => {
    upload.fields([
        { name: 'PortfolioLink', maxCount: 1 },
        { name: 'GalleryImages', maxCount: 10 },


    ])(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message
            });
        }
        next();
    });
}, addPortfolio)
router.get('/get-all-provider', getAllProvider)
router.delete('/delete-provider/:id', deleteprovider)

router.put('/provider_verify/:id', accountVerification)




//admin routes
router.get('/users', getAllUsers);
// router.get('/user/:id', getSingleUserById);
router.get('/get-single-user/:id', getSingleUser)
router.delete('/user-delete/:userId', deleteAccount);
router.put('/user-ban/:userId', banUserToggle);

router.get('/get-all-chat', getAllChat)

// provider rating router here 

router.post('/create-rating', createReview)
router.get('/get-all-review', getAllReview)
router.get('/get-review-by-providerId/:_id', getReviewByProviderId)

// banner router here 

router.post('/create-banner', upload.single('bannerImage'), createBanner)
router.get('/get-all-banner', getAllBanner)
router.delete('/delete-banner/:id', deleteBanner)
router.put('/update-banner-status/:id', updateBannerActiveStatus)

// describe work router here 

router.post('/create-describe-work-image', upload.single('image'), createDescribeWork)
router.get('/get-all-describe-work-image', getAllDescribeWork)
router.delete('/delete-describe-work-image/:id', deleteDescribeWork)
router.put('/update-work-banner-status/:id', updateWorkActiveStatus)

// plan journey router here 

router.post('/create-plan-journey-image', upload.single('image'), createplanJourneyImage)
router.get('/get-all-plan-journey-image', getAllJourneyImage)
router.delete('/delete-plan-journey-image/:id', deleteJourneyImage)
router.put('/update-plan-banner-status/:id', updatePlanActiveStatus)

// about image router here
router.post('/create-about-image', upload.single('image'), createAboutImage)
router.get('/get-all-about-image', getAllAboutImage)
router.delete('/delete-about-image/:id', deleteAboutImage)
router.put('/update-about-banner-status/:id', updateAboutActiveStatus)

// testimonial router here 

router.post('/create-testimonial', upload.single('image'), createTestimonial)
router.get('/get-all-testimonial', getAllTestimonial)
router.get('/get-single-testimonial/:id', getsingleTestimonial)
router.delete('/delete-testimonial/:id', deleteTestimonial)
router.put('/update-testimonial/:id', upload.single('image'), updateTestimonial)
router.put('/update-testimonial-status/:id', updateTestimonialActiveStatus)

// blog router here 

router.post('/create-blog', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'largeImage', maxCount: 1 },
]), createBlog)

router.get('/get-all-blog', getAllBlog)
router.get('/get-single-blog/:id', getSingleBlog)
router.put('/update-blog/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'largeImage', maxCount: 1 },
]), updateBlog)
router.delete('/delete-blog/:id', deleteBlog)

// blog comment router here 

router.post('/create-blog-comment', createBlogComment)
router.get('/get-all-blog-comment', getAllComments),
    router.get('/get-comment-by-blogId/:blogId', getBlogCommentByBlogId)
router.delete('/delete-blog-comment/:id', deleteBlogComment)

// create Chat router 

router.post('/create-chat', createChatWithNew)
router.get('/get-all-chat-record', getAllChatRecord)
router.get('/get-chat-by-providerId/:providerId', getChatByProviderid)
router.get('/get-chat-by-userId/:userId', getChatByUserid)
router.get('/get-chat-by-id/:id', getChatById)
router.put('/update-available-status/:providerId', updateAvailable)
router.put('/mark-user-chats-as-read/:userId', markUserChatsAsRead);
router.put('/mark-provider-chats-as-read/:providerId', markProviderChatsAsRead);
router.delete('/delete-chat-room/:chatRoomId', deleteChatRoom)
router.get('/get-chat-by-room/:chatRoomId', getchatByRoom)

// recharge route here 
router.post('/create-payment/:userId', createPayment);
router.post('/verify-payment', PaymentVerify);

// withdraw request routes here 
router.post('/create-withdraw-request', createWithdrawal)
router.put('/update-withdraw-status/:id', updateWithdrawStatus)
router.delete('/delete-withdraw-request/:id', deleteWithdrawRequest)
router.get('/get-withdrawals-by-providerid/:providerId', getWithdrawalsByProviderId);
router.get('/get-all-withdrawals', getAllWithdrawals);
router.get('/total-withdraw-and-commission', getTotalWithdrawAndCommission);

// commission route here 
router.post('/create-commission', createCommission)
router.put('/update-commission/:id', updateCommission)
router.get('/get-single-commision/:id', getSingleCommission)
router.get('/get-all-commision', getAllCommissions)
router.delete('/delete-commission/:id', deleteCommission)

// provider service router here
router.post('/create-provider-service', createProviderService)
router.get('/get-all-provider-service', getAllProviderService)
router.get('/get-provider-service-by-id/:providerId', getProviderServiceById)
router.put('/update-provider-service/:providerId', updateProviderService)
router.delete('/delete-provider-service/:providerId', deleteProviderService)
router.get('/get-service-by-provider/:providerId/:category', findbyProvider);

router.post('/create-call', createCall)
router.post('/call_status-call', call_status)


router.post('/provider_status/:provider_id', getProviderStatus)

router.post('/create_membership', createMemberShip)
router.get('/get_all_membership', getAllMemberShip)
router.get('/get_single_membership/:id', getSingleMemberShip)
router.put('/update_membership/:id', updateMemberShip)
router.delete('/delete_membership/:id', deleteMemberShip)

// globel user discount router here
router.post('/create_globel_discount', createGlobelUserRefDis)
router.get('/all_globel_discounts',getAllGlobelUserRefDis)
router.get('/globel_discount/:id',getSingleGlobelUserRef)
router.put('/update_globel_discount/:id',updateGlobelUserRef)
router.delete('/delete_globel_discount/:id',deleteGlobelUserRef)

// admin coupon routes here 
router.post('/create_admin_coupon',createAdminCoupon)
router.get('/all_admin_coupon',getAllAdminCoupon)
router.get('/admin_coupon/:id',getSingleAdminCoupon)
router.put('/update_admin_coupon/:id',updateAdminCoupon)
router.delete('/delete_admin_coupon/:id',deleteAdminCoupon)

// coupon check and member ship router here
router.post('/check_coupon_code',checkCouponCode)
router.post('/buy_membership/:providerId',buyMemberShip)
router.post('/membership_payment_verify',membershipPaymentVerify)

// verify before update things routes 
router.post('/otp_send_before_update',sendOtpForUpdateDetail)
router.post('/verify_otp_before_update',verifyOtpForUpdateDetail)

// newsletter routes here 

router.post('/create_newletter',createNewsLetter)
router.get('/all_newsletter',getAllNewsLetter)
router.get('/single_newsletter/:id',getSingleNewsLetter)
router.delete('/delete_newsletter/:id',deleteNewsLetter)
router.post('/send_message_newsletter',sendNewsLetterMessage)

// expertise router here 

router.post('/create_expertise',createExpertise)
router.get('/all_expertise',getAllExpertise)
router.get('/single_expertise/:id',getSingleExpertise)
router.put('/update_expertise/:id',updateExpertise)
router.delete('/delete_expertise/:id',deleteExpertise)

// term router here 

router.post('/create_term',createTerm)
router.get('/all_term',getTerm)
router.get('/single_term/:id',singleTerm)
router.put('/update_term/:id',updateTerm)

module.exports = router;