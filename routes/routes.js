const Router = required('express')
const router = new Router()
const userController = required("../controller/controller.js")

router.post('/user', userController.createUser)
router.get('/uyser', userController.getUsers)




module.exports = router