import configs from "../utility/configs.jsx";
import { App, Credentials } from "realm-web";
import { useState, useEffect } from "react";

const atlas_app = new App(configs.mongodb_app_id);

export default function useAtlasAuth() {
    const [atlas_user, set_atlas_user] = useState(null);
    const [user_listener, set_user_listener] = useState(() => (atlas_user) => {});

    const atlas_email_password_login = async (email, password) => {
        const credentials = Credentials.emailPassword(email, password);
        const authenticatedUser = await atlas_app.logIn(credentials);
        set_atlas_user(authenticatedUser);
        return authenticatedUser;
    };

    const atlas_email_password_signup = async (email, password) => {
        try {
            await atlas_app.emailPasswordAuth.registerUser(email,password);
            return atlas_email_password_login(email,password);
        } catch (error) {
            throw error;
        };
    };

    const atlas_fetch_user = async() => {
        if (!atlas_app.currentUser) return false;
        try {
            await atlas_app.currentUser.refreshCustomData();
            set_atlas_user(atlas_app.currentUser);
            return atlas_app.currentUser
        } catch (error) {
            throw error;
        };
    };

    const atlas_logout_user = async() => {
        if (!atlas_app.currentUser) return false;
        try {
            await atlas_app.currentUser.logOut();
            set_atlas_user(null);
            return true;
        } catch (error) {
            throw error;
        };
    };

    function get_user_email() {
        return atlas_user?._profile?.data?.email || atlas_user
    }

    useEffect(() => {user_listener(atlas_user)},[atlas_user])

    useEffect(() => {atlas_fetch_user()},[])

    function query_data () {
        const realm_service = global_context.atlas_auth.atlas_user.mongoClient("mongodb-atlas");
        const mongo_database = realm_service.db("Cluster0");

    }

    return {
        atlas_user,
        atlas_email_password_login,
        atlas_email_password_signup,
        atlas_fetch_user,
        get_user_email,
        atlas_logout_user,
        set_user_listener
    }
}