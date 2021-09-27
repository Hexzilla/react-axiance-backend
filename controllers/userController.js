const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');
const User = require('../models/userModel');
const sfController = require('./sfController');

exports.registerUser = async (req, res) => {
  const user = new User({
    uuid: uuidv4(),
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNum: req.body.phoneNum,
    countryCode: req.body.countryCode,
    language: req.body.language,
    entity: req.body.entity,
    nullPointId: null,
    emailVerified: false,
    socialData: {
      facebook: '',
      linkedin: '',
      instagram: '',
      skype: '',
      contactMethod: 'none',
      availableFrom: new Date(2021, 4, 20, 0, 0, 0),
      availableTo: new Date(2021, 4, 20, 0, 0, 0),
    },
    migrated: false,
    status: 'NEW',
  });

  user.save((err) => {
    if (err) {
      if (err.code === 11000) {
        res.status(409).send('This user already exists.');
      } else {
        res.status(500).send('Error registering new user, please try again.');
      }
    } else {
      console.log(chalk.cyan(`User: ${user.email}, has registered.`));
      sfController.register(user);
      const payload = {
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.USER_SECRET, {
        expiresIn: '12h',
      });
      res
        .status(200)
        .send({
          user: {
            uuid: user.uuid,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            nullPointId: user.nullPointId,
            emailVerified: user.emailVerified,
            countryCode: user.countryCode,
            socialData: user.socialData,
            entity: user.entity,
          },
          token,
        });
    }
  });
};

exports.getUserByID = async (req, res) => {
  const { uuid } = req.query;

  User.findOne({
    uuid,
  }, (err, user) => {
    if (err) {
      res.status(500).send('Internal error please try again');
    } else if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send({
        uuid: user.uuid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  });
};

exports.loginUser = async (req, res) => {
  const {
    email,
    password,
  } = req.body;
  console.log(req);
  User.findOne({
    email: email.toLowerCase(),
  }, (err, user) => {
    if (err) {
      res.status(500).send('We encountered an error, please try again later');
    } else if (!user) {
      res.status(401).send('Username or Password is not correct!');
    } else if (user.status === 'CLOSED') {
      res.status(401).send('Username or Password is not correct!');
    } else {
      user.isCorrectPassword(password, user, (error, same) => {
        if (error) {
          res.status(500).send('We encountered an error, please try again later');
        } if (!same) {
          res.status(401).send('Username or Password is not correct!');
        } else {
          console.log(chalk.cyan(`User: ${user.email}, with a status: ${user.status}, has logged in.`));

          const payload = { email };
          const token = jwt.sign(payload, process.env.USER_SECRET, {
            expiresIn: '12h',
          });
          res.status(200)
            .send({
              user: {
                uuid: user.uuid,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                nullPointId: user.nullPointId,
                emailVerified: user.emailVerified,
                countryCode: user.countryCode,
                socialData: user.socialData,
                entity: user.entity,
              },
              token,
            });
        }
      });
    }
  });
};

exports.confirmEmail = async (req, res) => {
  const pinCorrect = await sfController.verifyEmailCode(
    req.body.uuid,
    req.body.email,
    req.body.pinCode,
  );

  if (pinCorrect) {
    User.findOneAndUpdate({
      uuid: req.body.uuid,
    }, { emailVerified: true }, { new: true }, (error, user) => {
      if (error) {
        res.send(error);
      } else if (user) {
        console.log(chalk.cyan(`User: ${req.body.email}, verified their email.`));
        res.status(200).send('Email verified');
      } else {
        res.status(500).send('Failed');
      }
    });
  } else {
    res.status(401).send('Invalid Code, please try again');
  }
};

exports.confirmEmailPassword = async (req, res) => {
  User.findOne({
    email: req.body.email.toLowerCase(),
  }, async (error, user) => {
    if (error) {
      res.status(500).send();
    } else if (user) {
      const pinCorrect = await sfController.verifyEmailPasswordCode(
        user.uuid,
        req.body.email,
        req.body.pinCode,
      );

      if (pinCorrect) {
        console.log(chalk.cyan(`User: ${user.email}, verified their email, for password.`));
        User.findOneAndUpdate({
          email: req.body.email.toLowerCase(),
        }, { emailVerified: true }, { new: true }, (err) => {
          if (err) {
            res.send(err);
          } else {
            res.status(200).send('Email verified');
          }
        });
      } else {
        res.status(401).send('Unauthorized: Invalid token');
      }
    } else {
      res.status(404).send("User with this email, doesn't exist");
    }
  });
};

exports.authenticateUser = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, process.env.USER_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else if (decoded) {
        req.email = decoded.email;

        User.findOne({
          email: req.email.toLowerCase(),
        }, (error, user) => {
          console.log('User: ', user);
          res.status(200).send({
            user: {
              uuid: user.uuid,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              nullPointId: user.nullPointId,
              emailVerified: user.emailVerified,
              countryCode: user.countryCode,
              socialData: user.socialData,
              entity: user.entity,
            },
          });
        });
      } else {
        res.status(404).send("User with this email, doesn't exist");
      }
    });
  }
};

exports.updateUser = async (req, res) => {
  if (await User.exists({ uuid: req.body.uuid })) {
    jwt.verify(req.body.token, process.env.USER_SECRET, (err) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        User.findOneAndUpdate({
          uuid: req.body.uuid,
        }, req.body.updateData, { new: true }, (error, result) => {
          if (error) {
            res.send(error);
          }
          res.send(result);
        });
      }
    });
  } else {
    res.status(404).send("User with this email, doesn't exist");
  }
};

exports.sfUpdatePass = async (req, res) => {
  if (await User.exists({ uuid: req.body.uuid })) {
    jwt.verify(req.body.token, process.env.USER_SECRET, (err) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        console.log(chalk.cyan(`User: ${req.body.uuid}, had their password updated from SF.`));
        User.findOneAndUpdate({
          uuid: req.body.uuid,
        }, {
          password: req.body.updateData.password,
          migrated: false,
        }, { new: true }, (error, result) => {
          if (error) {
            res.send(error);
          } else if (result) {
            res.send(result);
          } else {
            res.status(500).send('User not updated');
          }
        });
      }
    });
  } else {
    res.status(404).send("User with this email, doesn't exist");
  }
};

exports.updateUserPass = async (req, res) => {
  if (await User.exists({ email: req.body.email.toLowerCase() })) {
    jwt.verify(req.body.token, process.env.USER_SECRET, (err) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        User.findOneAndUpdate({
          email: req.body.email.toLowerCase(),
        }, {
          password: req.body.updateData.password,
          migrated: false,
        }, { new: true }, (error, result) => {
          if (error) {
            res.send(error);
          }
          res.send(result);
        });
      }
    });
  } else {
    res.status(404).send("User with this email, doesn't exist");
  }
};

exports.getToken = async (req, res) => {
  const payload = {
    secret: req.params.secret,
  };
  const token = jwt.sign(payload, process.env.USER_SECRET, {
    expiresIn: '1h',
  });
  res.status(200)
    .send(token);
};

exports.changePassword = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  }
  jwt.verify(token, process.env.USER_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else if (decoded) {
      const userEmail = decoded.email;

      User.findOne({
        email: userEmail.toLowerCase(),
      }, (errr, user) => {
        if (user) {
          user.isCorrectPassword(req.body.oldPassword, user, (error, same) => {
            if (error) {
              res.status(500).send('Internal error please try again');
            } else if (!same) {
              res.status(401).send('The password you entered is not correct');
            } else {
              User.findOneAndUpdate({
                email: userEmail.toLowerCase(),
              }, { password: req.body.password, migrated: false }, (error1) => {
                if (error1) {
                  res.send(error1);
                } else {
                  res.status(200).send({
                    user: {
                      uuid: user.uuid,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                      nullPointId: user.nullPointId,
                      emailVerified: user.emailVerified,
                      countryCode: user.countryCode,
                      socialData: user.socialData,
                      entity: user.entity,
                    },
                  });
                }
              });
            }
          });
        } else {
          res.status(404).send("User with this email, doesn't exist");
        }
      });
    }
  });
};

exports.resetPassword = async (req, res) => {
  User.findOne({
    email: req.body.email.toLowerCase(),
  }, async (error, user) => {
    if (!user) {
      res.status(404).send("User with this email, doesn't exist");
    } else {
      sfController.resetPasswordCode(user.uuid);
      res.status(200).send();
    }
  });
};

exports.updateSocials = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, process.env.USER_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        const userEmail = decoded.email;
        User.findOneAndUpdate({
          email: userEmail.toLowerCase(),
        }, { socialData: req.body.socialData }, (error1) => {
          if (error1) {
            res.status(500).send(error1);
          } else {
            sfController.updateSocialData(req.body.uuid, req.body.socialData);
            console.log(chalk.cyan(`User: ${userEmail}, updated their socials.`));
            res.status(200).send();
          }
        });
      }
    });
  }
};

exports.support = async (req, res) => {
  console.log(chalk.cyan(`User: ${req.body.email}, has made a support request in`));
  try {
    sfController.supportMessage(req.body);
  } catch (error) {
    res.status(500).send('We encountered an error, please try again later');
  }

  res.status(200).send();
};

exports.createUser = async (req, res) => {
  const user = new User({
    uuid: req.body.uuid,
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNum: req.body.phoneNum,
    countryCode: req.body.countryCode,
    language: req.body.language,
    entity: req.body.entity,
    emailVerified: req.body.emailVerified,
    nullPointId: null,
    socialData: {
      facebook: '',
      linkedin: '',
      instagram: '',
      skype: '',
      contactMethod: 'none',
      availableFrom: new Date(2021, 4, 20, 0, 0, 0),
      availableTo: new Date(2021, 4, 20, 0, 0, 0),
    },
    migrated: false,
    status: 'NEW',
  });

  jwt.verify(req.body.token, process.env.USER_SECRET, (err) => {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      user.save((error) => {
        if (error) {
          if (error.code === 11000) {
            res.status(409)
              .json('This user already exists.');
          } else {
            res.status(500)
              .json('Error registering new user, please try again.');
          }
        } else {
          res.status(200)
            .send({ user });
        }
      });
    }
  });
};
