export async function load(event) {
    const signedIn = event.locals.user ? true : false;
    return {
        signedIn: signedIn
    }
}