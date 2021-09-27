// exports.check = async (req, res) => {
//   const { token } = req.query;

//   console.log('User Auth: ', token);

//   if (!token) {
//     res.status(401).send('Unathorized: No token provided');
//   } else {
//     jwt.verify(token, process.env.USER_SECRET, (err, decoded) => {
//       if (err) {
//         res.status(401).send('Unathorized: Invalid token');
//       } else {
//         req.email = decoded.email;

//         User.findOne({
//           email: req.email.toLowerCase(),
//         }, (error, user) => {
//           res.status(200).send({
//             user: {
//               uuid: user.uuid,
//               firstName: user.firstName,
//               lastName: user.lastName,
//               email: user.email,
//               phoneNum: user.phoneNum,
//               countryCode: user.countryCode,
//               language: user.language,
//               nullPointId: user.nullPointId,
//               emailVerified: user.emailVerified,
//               socialData: user.socialData,
//               entity: user.entity,
//             },
//           });
//         });
//       }
//     });
//   }
// };
