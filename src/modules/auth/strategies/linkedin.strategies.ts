// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-linkedin-oauth2';
// import { Profile } from 'passport-linkedin-oauth2';

// @Injectable()
// export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
//   constructor() {
//     super({
//       clientID: process.env.CLIENT_ID_LINKEDIN as string,
//       clientSecret: process.env.CLIENT_SECRET_LINKEDIN as string,
//       callbackURL: process.env.CLIENT_COLLBACK_URL_LINKEDIN as string,
//       scope: ['r_emailaddress', 'r_liteprofile'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile,
//     done: Function,
//   ): Promise<any> {
//     console.log('LinkedIn OAuth profile:', profile);

//     const user = {
//       provider: 'linkedin',
//       linkedinId: profile.id,
//       displayName: profile.displayName,
//       emails: profile.emails,
//       photos: profile.photos,
//     };

//     done(null, user);
//   }
// }
