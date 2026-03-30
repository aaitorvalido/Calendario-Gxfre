import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import TwitchProvider from "next-auth/providers/twitch"; // 1. Importamos Twitch
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export const authOptions: AuthOptions = {
  providers: [
    // 2. AÑADIMOS EL PROVEEDOR DE TWITCH AQUÍ
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Cuentas Gxfre",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.usuario || !credentials?.password) return null;

        const { data: user, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('usuario', credentials.usuario)
          .single();

        if (error || !user) return null;

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) return null;

        return { id: String(user.id), name: user.usuario, email: user.email };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Si el usuario acaba de iniciar sesión
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Si viene de Twitch, guardamos su nombre de usuario de Twitch
        if (account?.provider === 'twitch' && profile) {
          token.name = (profile as any).preferred_username || user.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // @ts-ignore (añadimos el ID por si lo necesitas luego)
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  // Usamos la variable de entorno, si no existe usa el string (pero mejor ponla en Vercel)
  secret: process.env.NEXTAUTH_SECRET || "secreto_temporal_gxfre_2026",
};