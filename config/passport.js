var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var DiscordStrategy = require('passport-discord').Strategy;
var configAuth = require('./auth'),
flash = require('connect-flash');

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var configAuth = require('./auth');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
module.exports = function(passport) {

var scopes = ['identify', 'email', 'guilds', 'guilds.join'];
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
passport.use(new FacebookStrategy({
    clientID: '430860707304410',
    clientSecret: 'ab2fb9b336c839be6842246fba7c1921',
    callbackURL: 'http://takohell.com:3000/auth/facebook/callback',
    profileFields : ['id', 'displayName', 'name' , 'emails'],
    passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    connection.query("SELECT * FROM facebook WHERE facebook_id = ?", [profile.id], function(err, user){
     if (err){
            return done(err);
        }
        else if (user.length == 0){
            var email = profile.emails[0].value;
            var username = profile.name.givenName + ' ' + profile.name.familyName;
            var provider = "facebook";
            var token = accessToken;
        connection.query("INSERT INTO facebook (name, email, username, provider, token) VALUES (?, ?, ?, ?, ?)",
            [name, email, username, provider], function(err){

                })

        }
        else{
            return done(err, user);
        }

    });
});
    return done(null, profile);
  }));

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err) return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'Cette email et deja utilisé.'));
                } else {
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)
                    };

                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Aucun utilisateur trouvé.')); 
                }

                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Mot de pass incorect.')); 
                return done(null, rows[0]);
            });
        })
    );
    passport.use(new DiscordStrategy(
        {
    clientID: '269481343543410688',
    clientSecret: 'jqchyjxmPxbUp1JDPuZCkcKp3MIJ-XZL',
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: scopes,
    },
        function(accessToken, refreshToken, profile, cb, req, done) {
                        process.nextTick(function(){
            connection.query("SELECT * FROM discord WHERE username = ?",[profile.username], function(err, rows) {
                if (err) return done(err);
                if (rows.length) {
                    return done(null, false, console.log("nah !"));
                } else {

                    var newUserMysql = {
                        username: profile.username,
                        email: profile.email,
                        avatar: profile.avatar,
                        discriminator: profile.discriminator
                    };

                    var insertQuery = "INSERT INTO discord ( username, email, avatar, discriminator ) values (?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.avatar, newUserMysql.discriminator],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });

    })
    }));
};
