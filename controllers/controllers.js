class UserController{
	async createUser(req, res){
		const {name,surname}= req.body
		console.log(name,suname)
		res.json('ok')
	}
	async getUsers(req, res){
		
	}
}
module.exports = UserController()