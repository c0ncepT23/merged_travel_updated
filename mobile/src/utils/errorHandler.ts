export const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);
  
  // Handle auth errors
  if (error.code) {
    switch(error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/requires-recent-login':
        return 'Please log out and log back in to perform this action';
      case 'storage/unauthorized':
        return 'You don\'t have permission to access this file';
      case 'storage/canceled':
        return 'Upload was canceled';
      case 'storage/unknown':
        return 'An unknown error occurred during upload';
      default:
        return `Error: ${error.message || 'Something went wrong'}`;
    }
  }
  
  return error.message || 'An unexpected error occurred';
};