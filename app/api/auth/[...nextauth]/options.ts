import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export const authOptions: AuthOptions = {
  providers: [
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
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.email = token.email as string;
      return session;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "secreto_temporal_gxfre_2026",
};