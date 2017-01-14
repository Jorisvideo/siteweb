module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs');
	});
	app.get('/auth', function(req, res) {
		res.render('auth.ejs');
	});
	// =====================================
	// LOGIN ===============================
	// =====================================
	app.get('/login', function(req, res) {

		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/auth/discord', passport.authenticate('discord', { scope: ['identify', 'email', 'guilds', 'guilds.join'] }), function(req, res) {
		console.log("account" + req.user);
		});
app.get('/auth/discord/callback', passport.authenticate('discord', { 
									successRedirect : '/profile',
									failureRedirect : '/',
									failureFlash : true }));

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
    }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));

	// =====================================
	// LOGOUT ==============================
	// =====================================


	app.get('/commands', function(req, res){
		Commands.find({}, function(err, users){
			if(err){
				console.log(err);
			}else{
				res.render('commands.ejs', {users : users});
				console.log('tous les commands dispo : ', users);
			}
		});
});
	app.get('/dash/dashbord', isLoggedIn, function(req, res){
        	User.find({}, function(err, users){
        if(err){
          console.log(err);
        } else{
            res.render('test', {users : users});
        }
    });
});
 app.post('/dash/dashbord', isLoggedIn, function(req, res){
	 	var cmd = new Commands();
		cmd.name = req.body.name;
		cmd.description = req.body.description;
		cmd.usage = req.body.usage;
		cmd.save(function(err){
			if(err){
				res.render('testdesign', {title: 'Accueil', description: 'Une erreur s\'est produite'});
			}else{
			res.redirect('/commands');
			}
		});
	 });
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};
function isLoggedIn(req, res, next) {

	if (req.isAuthenticated())
		return next();

	res.redirect('/auth');
}
