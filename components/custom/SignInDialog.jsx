"use client";
import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Lookup from "@/data/Lookup";
import { Button } from "../ui/button";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import { useUser } from "@/hooks/use-users";
import uuid4 from "uuid4";

// Separate component that will be wrapped with GoogleOAuthProvider
function GoogleLoginButton({ onSuccess, isLoading }) {
  const login = useGoogleLogin({
    onSuccess,
    onError: (errorResponse) => console.log(errorResponse),
  });

  return (
    <Button
      className="bg-blue-500 text-white hover:bg-blue-400 mt-3"
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? "Signing in..." : "Sign In With Google"}
    </Button>
  );
}

function SignInDialog({ openDialog, closeDialog }) {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { createUser, getUserByEmail } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    try {
      console.log(tokenResponse);
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: "Bearer " + tokenResponse?.access_token } }
      );

      console.log(userInfo);
      const user = userInfo.data;

      // First check if user exists
      const existingUser = await getUserByEmail(user?.email);

      if (existingUser) {
        // User already exists, update context
        setUserDetail(existingUser);
        if (typeof window !== undefined) {
          localStorage.setItem("userDetails", JSON.stringify(existingUser));
        }
      } else {
        // Create new user
        const newUser = await createUser({
          name: user?.name,
          email: user?.email,
          picture: user?.picture,
          uid: uuid4(),
        });

        if (newUser) {
          setUserDetail(newUser);
          if (typeof window !== undefined) {
            localStorage.setItem("userDetails", JSON.stringify(newUser));
          }
        }
      }

      // Close dialog and refresh
      closeDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col items-center justify-center gap-3">
              <h2 className="font-bold text-2xl text-center text-white">
                {Lookup.SIGNIN_HEADING}
              </h2>
              <p className="mt-2 text-center">{Lookup.SIGNIN_SUBHEADING}</p>

              <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY}
              >
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  isLoading={isLoading}
                />
              </GoogleOAuthProvider>

              <p>{Lookup?.SIGNIn_AGREEMENT_TEXT}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default SignInDialog;
