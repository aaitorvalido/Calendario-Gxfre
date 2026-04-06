import { AuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch"; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export const authOptions: AuthOptions = {
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      profile(profile) {
        // Mapeamos los datos que vienen de Twitch para estandarizarlos
        return {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    //  ESTE CALLBACK SE ENCARGA DE GUARDAR AL USUARIO EN LA DB SI NO EXISTE
    async signIn({ user, account }) {
      if (account?.provider === "twitch") {
        try {
          const email = user.email;
          const nombre = user.name;

          if (!email) {
            console.error("El usuario de Twitch no tiene email asociado.");
            return false;
          }

          // 1. Verificamos si el usuario ya está en nuestra tabla 'usuarios'
          const { data: existingUser, error: fetchError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle(); // No da error si no encuentra nada, devuelve data: null

          if (fetchError) {
            console.error("Error al consultar Supabase:", fetchError.message);
            return false;
          }

          // 2. Si el email NO existe en nuestra DB (data es null), lo registramos
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('usuarios')
              .insert([
                { 
                  usuario: nombre, 
                  email: email, 
                  password: null // ⚠️ IMPORTANTE: La columna 'password' debe ser NULLABLE en Supabase
                }
              ]);
            
            if (insertError) {
              console.error("Error al insertar usuario nuevo:", insertError.message);
              return false; // Si falla el guardado, bloqueamos el acceso para evitar fallos de ID
            }
            console.log(`Usuario nuevo registrado: ${email}`);
          }
          
          return true; // Acceso permitido
        } catch (error) {
          console.error("Error crítico en el proceso de signIn:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Pasamos los datos esenciales al Token JWT
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      // Pasamos los datos del Token a la Sesión accesible desde el cliente (useSession)
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // @ts-ignore
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: { 
    signIn: '/login',
    error: '/login', 
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  secret: process.env.NEXTAUTH_SECRET,
};