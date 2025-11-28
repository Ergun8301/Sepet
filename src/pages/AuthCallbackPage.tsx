import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log("🚀🚀🚀 AuthCallbackPage MONTÉ - Version avec localStorage 🚀🚀🚀");

    const handleOAuthCallback = async () => {
      try {
        console.log("🔄 handleOAuthCallback démarré");

        // 🔹 Récupérer depuis localStorage (Supabase OAuth perd les query params)
        const storedRole = localStorage.getItem("oauth_desired_role");
        const storedFlowToken = localStorage.getItem("oauth_flow_token");

        // Fallback sur URL params si localStorage vide
        let role = storedRole || searchParams.get("role") || "client";
        const flowToken = storedFlowToken || searchParams.get("flow_token");

        console.log("🔁 OAuth callback → rôle:", role, "| flow_token:", flowToken);
        console.log("📦 Depuis localStorage → role:", storedRole, "| flow_token:", storedFlowToken);

        // 🔹 Nettoyer localStorage après récupération
        localStorage.removeItem("oauth_desired_role");
        localStorage.removeItem("oauth_flow_token");

        // 🔹 attendre session valide
        let session = null;
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            session = data.session;
            break;
          }
          await new Promise((r) => setTimeout(r, 1000));
        }

        if (!session) {
          setError("Impossible de récupérer la session après OAuth");
          setLoading(false);
          return;
        }

        const user = session.user;
        console.log("✅ Session récupérée pour:", user.email);

        // 1️⃣ Si un flow_token est présent → récupérer le rôle et associer à l'utilisateur
        if (flowToken) {
          // ✅ Lire le desired_role depuis flow_states (plus fiable que l'URL)
          const { data: flowData } = await supabase
            .from("flow_states")
            .select("desired_role")
            .eq("token", flowToken)
            .maybeSingle();

          if (flowData?.desired_role) {
            role = flowData.desired_role;
            console.log("✅ Rôle récupéré depuis flow_states:", role);
          }

          // Marquer le flow_state comme utilisé
          await supabase
            .from("flow_states")
            .update({ auth_user_id: user.id, used: true })
            .eq("token", flowToken);
        }

        // 2️⃣ Mise à jour / création du profil
        // D'abord vérifier si le profil existe
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("auth_id", user.id)
          .maybeSingle();

        console.log("📋 Profil existant:", existingProfile, "| Rôle souhaité:", role);

        if (existingProfile) {
          // ✅ Profil existe → UPDATE explicite du rôle
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ role, email: user.email })
            .eq("auth_id", user.id);

          if (updateError) {
            console.warn("⚠️ Erreur UPDATE profil:", updateError.message);
          } else {
            console.log("✅ Profil MIS À JOUR avec rôle:", role);
          }
        } else {
          // ✅ Profil n'existe pas → INSERT
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              auth_id: user.id,
              email: user.email,
              role,
            });

          if (insertError) {
            console.warn("⚠️ Erreur INSERT profil:", insertError.message);
          } else {
            console.log("✅ Profil CRÉÉ avec rôle:", role);
          }
        }

        // 3️⃣ Vérifier si le profil est complet (pour les clients)
        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("role, first_name, last_name")
          .eq("auth_id", user.id)
          .single();

        if (fetchError) {
          console.warn("⚠️ Impossible de récupérer le profil:", fetchError.message);
        }

        // 4️⃣ Redirection selon rôle ET complétude du profil
        setIsRedirecting(true);
        if (role === "merchant") {
          navigate("/merchant/dashboard");
        } else if (role === "client") {
          // ✅ Vérifier si le profil client est complet
          if (!profileData?.first_name || !profileData?.last_name) {
            console.log("⚠️ Profil incomplet → redirection vers /customer/auth");
            // Profil incomplet → rediriger vers la page d'auth où le modal s'affichera
            navigate("/customer/auth");
          } else {
            console.log("✅ Profil complet → redirection vers /offers");
            // Profil complet → redirection normale
            navigate("/offers");
          }
        } else {
          // Fallback
          navigate("/offers");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6932] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRedirecting ? "Redirection en cours..." : "Finalisation de la connexion..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#3A6932] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5226] transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;