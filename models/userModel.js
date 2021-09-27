const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const sha512 = require('js-sha512');

const saltRounds = 10;

const SocialSchema = new mongoose.Schema({
  facebook: {
    type: String,
    required: false,
  },
  linkedin: {
    type: String,
    required: false,
  },
  instagram: {
    type: String,
    required: false,
  },
  skype: {
    type: String,
    required: false,
  },
  contactMethod: {
    type: String,
    required: false,
  },
  availableFrom: {
    type: Date,
    required: false,
  },
  availableTo: {
    type: Date,
    required: false,
  },
});

const UserSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNum: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  nullPointId: {
    type: String,
    unique: false,
    sparse: true,
  },
  emailVerified: {
    type: Boolean,
    required: true,
  },
  socialData: {
    type: SocialSchema,
  },
  entity: {
    type: String,
    required: true,
  },
  migrated: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
});

UserSchema.pre('save', function CheckExistence(next) {
  // Check if new
  if (this.isNew || this.isModified('password')) {
    const document = this;
    bcrypt.hash(document.password, saltRounds,
      (err, hashedPassword) => {
        if (err) {
          next(err);
        } else {
          document.password = hashedPassword;
          next();
        }
      });
  } else {
    next();
  }
});

UserSchema.pre('findOneAndUpdate', function updateUser(next) {
  const document = this._update;
  if (document.password) {
    bcrypt.hash(document.password, saltRounds,
      (err, hashedPassword) => {
        if (err) {
          next(err);
        } else {
          document.password = hashedPassword;
          next();
        }
      });
  } else {
    next();
  }
});

UserSchema.methods.isCorrectPassword = function CheckPassword(password, user, callback) {
  if (user.migrated) {
    const passHash = sha512(password);
    const finalHash = sha512(passHash + user.salt);

    callback(null, user.password === finalHash);
  } else {
    bcrypt.compare(password, this.password, (err, same) => {
      if (err) {
        callback(err);
      } else {
        callback(err, same);
      }
    });
  }
};

module.exports = mongoose.model('User', UserSchema);
