import { QwikAuth$ } from "@auth/qwik";
import Auth0 from "@auth/qwik/providers/auth0";

/**
 * `@auth/qwik` doesn't export User, Session, etc. so we cannot augment them
 *
 * Even when importing @auth/core/types, it doesn't work
 *
 * declare module "@auth/core/types" {
 *   interface Session {
 *     user: {
 *       address: string
 *     } & DefaultSession["user"]
 *   }
 * }
 */

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({
    providers: [
      Auth0({
        profile(profile) {
          return {
            id: profile.sub,
            sub: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            roles: ['admin'],
          };
        },
      }),
    ],
    callbacks: {
      jwt({ token, profile }) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (profile) {
          token.id = profile.sub;
          token.sub = profile.sub as string | undefined;
          token.roles = profile.roles;
          token.permissions = profile.permissions;
        }

        return token;
      },
      session({ session, token }) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        //           ^^^^^ TS2339: Property 'roles' does not exist on type `AdapterUser & User`

        return session;
      },
    },
  }),
);