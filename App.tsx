import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Post, User, Comment as CommentType, FilterOptions, UserStory, SortBy, TopContributor, TrendingLocation, LegalContentType, GeolocationStatus, Credentials, FiestaEvent } from './types';
import { cityCoordinates } from './constants';
import { legalTexts } from './legalTexts';
import Header from './components/Header';
import Feed from './components/Feed';
import PostDetail from './components/PostDetail';
import Profile from './components/Profile';
import UploadModal from './components/UploadModal';
import StoriesTray from './components/StoriesTray';
import StoryViewer from './components/StoryViewer';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import HeroSection from './components/HeroSection';
import FeedFilters from './components/FeedFilters';
import CallToActionUpload from './components/CallToActionUpload';
import GamificationSidebar from './components/GamificationSidebar';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import GeolocationModal from './components/GeolocationModal';
import FiestaFinder from './components/FiestaFinder';
import { generateDescription, searchPostsWithAI, findFiestasWithAI } from './services/geminiService';
import { useDebounce } from './hooks/useDebounce';
import { auth, db, storage } from './services/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


type View = 'feed' | 'post' | 'profile';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Record<string, CommentType[]>>({});
  const [stories, setStories] = useState<UserStory[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isFiestaFinderOpen, setFiestaFinderOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [legalModalContent, setLegalModalContent] = useState<LegalContentType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    mediaType: 'all',
  });
  
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const [currentStoryUserIndex, setCurrentStoryUserIndex] = useState<number | null>(null);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>(null);
  
  const feedRef = useRef<HTMLDivElement>(null);

  // Listener para el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario ha iniciado sesión
        const appUser: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'UsuarioAnónimo',
          avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
        };
        setCurrentUser(appUser);
      } else {
        // Usuario ha cerrado sesión
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);
  
    // useEffect para cargar los posts desde Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsFromFirestore: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsFromFirestore.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(postsFromFirestore);
    });
    return () => unsubscribe();
  }, []);

  // useEffect para cargar los usuarios desde Firestore
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersFromFirestore: User[] = [];
      querySnapshot.forEach((doc) => {
        usersFromFirestore.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersFromFirestore);
    });
    return () => unsubscribe();
  }, []);

  // useEffect para cargar los comentarios del post seleccionado
  useEffect(() => {
    if (!selectedPostId) {
      return;
    }

    const q = query(collection(db, "posts", selectedPostId, "comments"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsFromFirestore: CommentType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        commentsFromFirestore.push({ 
          id: doc.id,
          postId: selectedPostId,
          userId: data.userId,
          text: data.text,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      
      setComments(prev => ({
        ...prev,
        [selectedPostId]: commentsFromFirestore
      }));
    });

    return () => unsubscribe();
  }, [selectedPostId]);


  useEffect(() => {
    if (debouncedSearchQuery) {
      const performSearch = async () => {
        setIsSearching(true);
        const results = await searchPostsWithAI(debouncedSearchQuery, posts, users);
        setSearchResults(results);
        setIsSearching(false);
      };
      performSearch();
    } else {
      setSearchResults(null);
    }
  }, [debouncedSearchQuery, posts, users]);

  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId);
    setView('post');
  };

  const handleUserSelect = (userId: string) => {
    if (!userId) return;
    setSelectedUserId(userId);
    setView('profile');
  };

  const handleCloseDetail = () => {
    setSelectedPostId(null);
    setSelectedUserId(null);
    setView('feed');
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
  
    const isLiked = post.likedBy.includes(currentUser.id);
  
    if (isLiked) {
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(currentUser.id)
      });
    } else {
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(currentUser.id)
      });
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', postId);
    const commentsCol = collection(postRef, 'comments');
    
    await addDoc(commentsCol, {
      userId: currentUser.id,
      text: text,
      timestamp: serverTimestamp(),
    });

    await updateDoc(postRef, {
        commentCount: increment(1)
    });
  };

  const handleUpload = async (formData: { title: string; description: string; city: string; file: File }) => {
    if (!currentUser) {
        alert("Debes iniciar sesión para publicar.");
        return;
    }

    let finalDescription = formData.description;
    if (!finalDescription) {
        try {
            finalDescription = await generateDescription(formData.title, formData.city);
        } catch (error) {
            console.error("Failed to generate description:", error);
            finalDescription = "¡Un recuerdo maravilloso de la fiesta!";
        }
    }

    try {
        // 1. Subir archivo a Firebase Storage
        const filePath = `posts/${currentUser.id}/${Date.now()}_${formData.file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadResult = await uploadBytes(storageRef, formData.file);
        
        // 2. Obtener la URL de descarga del archivo
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // 3. Crear el documento del post en Firestore
        const newPost = {
            userId: currentUser.id,
            title: formData.title,
            description: finalDescription,
            city: formData.city,
            mediaUrl: downloadURL,
            mediaType: formData.file.type.startsWith('video') ? 'video' : 'image',
            timestamp: serverTimestamp(),
            likes: 0,
            likedBy: [],
            commentCount: 0,
        };

        await addDoc(collection(db, "posts"), newPost);
        
        setUploadModalOpen(false);

    } catch (error) {
        console.error("Error al subir la publicación:", error);
        alert("Ocurrió un error al subir tu publicación. Por favor, inténtalo de nuevo.");
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;

    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete || postToDelete.userId !== currentUser.id) {
      alert("No tienes permiso para borrar esta publicación.");
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) {
      try {
        // Crear una referencia al archivo en Storage usando la URL
        const storageRef = ref(storage, postToDelete.mediaUrl);
        // Borrar el archivo
        await deleteObject(storageRef);

        // Borrar el documento de Firestore
        const postDocRef = doc(db, 'posts', postId);
        await deleteDoc(postDocRef);

        handleCloseDetail();
        
      } catch (error) {
        console.error("Error al eliminar la publicación:", error);
        // Si el archivo no existe en Storage (puede pasar si hay un error previo),
        // borramos igualmente la entrada de la base de datos.
        if ((error as any).code === 'storage/object-not-found') {
           console.warn("El archivo en Storage no se encontró, pero se procederá a eliminar la entrada de Firestore.");
            const postDocRef = doc(db, 'posts', postId);
            await deleteDoc(postDocRef);
            handleCloseDetail();
        } else {
          alert("Ocurrió un error al eliminar la publicación. Por favor, inténtalo de nuevo.");
        }
      }
    }
  };

  const handleLogin = async ({ email, password }: Credentials) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginModalOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión. Comprueba tu email y contraseña.");
    }
  };

  const handleSignUp = async ({ email, password, username }: Credentials) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const finalUsername = username || email.split('@')[0];
      const user = userCredential.user;
      
      const photoURL = `https://picsum.photos/seed/${user.uid}/100/100`;

      await updateProfile(user, {
        displayName: finalUsername,
        photoURL: photoURL
      });
      
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        username: finalUsername,
        avatarUrl: photoURL
      });

      setSignUpModalOpen(false);
    } catch (error) {
      console.error("Error al registrarse:", error);
      alert("Error al registrarse. Puede que el email ya esté en uso.");
    }
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        username: user.displayName || user.email?.split('@')[0],
        avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`
      }, { merge: true });


      setLoginModalOpen(false);
      setSignUpModalOpen(false);
    } catch (error) {
      console.error("Error con el inicio de sesión de Google:", error);
      alert("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleCloseDetail();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  
  const handleUpdateAvatar = async (file: File) => {
    if (!currentUser || !auth.currentUser) {
      alert("Debes iniciar sesión para cambiar tu foto de perfil.");
      return;
    }

    try {
      const oldAvatarUrl = auth.currentUser.photoURL;
      if (oldAvatarUrl && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const oldStorageRef = ref(storage, oldAvatarUrl);
          await deleteObject(oldStorageRef);
        } catch (error) {
          if ((error as any).code !== 'storage/object-not-found') {
            console.warn("No se pudo borrar el avatar antiguo. Puede que no existiera.", error);
          }
        }
      }

      const filePath = `avatars/${currentUser.id}/${file.name}`;
      const newStorageRef = ref(storage, filePath);
      await uploadBytes(newStorageRef, file);
      const newAvatarUrl = await getDownloadURL(newStorageRef);

      await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });

      const userDocRef = doc(db, 'users', currentUser.id);
      await updateDoc(userDocRef, { avatarUrl: newAvatarUrl });

      setCurrentUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
    } catch (error) {
      console.error("Error al actualizar el avatar:", error);
      alert("Ocurrió un error al actualizar tu foto de perfil.");
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser || !auth.currentUser) {
      alert("Debes iniciar sesión para eliminar tu foto de perfil.");
      return;
    }

    try {
      const oldAvatarUrl = auth.currentUser.photoURL;
      if (oldAvatarUrl && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const oldStorageRef = ref(storage, oldAvatarUrl);
          await deleteObject(oldStorageRef);
        } catch (error) {
          if ((error as any).code !== 'storage/object-not-found') {
            console.warn("No se pudo borrar el avatar del Storage. Puede que no existiera.", error);
          }
        }
      }

      const defaultAvatarUrl = `https://picsum.photos/seed/${currentUser.id}/100/100`;
      await updateProfile(auth.currentUser, { photoURL: defaultAvatarUrl });
      
      const userDocRef = doc(db, 'users', currentUser.id);
      await updateDoc(userDocRef, { avatarUrl: defaultAvatarUrl });

      setCurrentUser(prev => prev ? { ...prev, avatarUrl: defaultAvatarUrl } : null);
    } catch (error) {
      console.error("Error al eliminar el avatar:", error);
      alert("Ocurrió un error al eliminar tu foto de perfil.");
    }
  };


  const handleBlockUser = (userIdToBlock: string) => {
      if (!currentUser || userIdToBlock === currentUser.id) return;
      if (window.confirm('¿Seguro que quieres bloquear a este usuario? No verás su contenido.')) {
        setBlockedUsers(prev => new Set(prev).add(userIdToBlock));
      }
  };

  const handleUnblockUser = (userIdToUnblock: string) => {
    if (window.confirm('¿Seguro que quieres desbloquear a este usuario?')) {
      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userIdToUnblock);
        return newSet;
      });
    }
  };

  const handleOpenLegalModal = (type: LegalContentType) => {
    setLegalModalContent(type);
  };
  
  const handleSortChange = (newSortBy: SortBy) => {
    if (newSortBy === 'nearby') {
      setGeolocationStatus('requesting');
    } else {
      setSortBy(newSortBy);
      setUserLocation(null);
    }
  };

  const handleAllowGeolocation = () => {
    setGeolocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setSortBy('nearby');
        setGeolocationStatus(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeolocationStatus('denied');
        } else {
          setGeolocationStatus('error');
        }
      }
    );
  };
  
  const displayedPosts = useMemo(() => {
    let filtered = searchResults ? posts.filter(p => searchResults.includes(p.id)) : posts;
    return filtered.filter(post => !blockedUsers.has(post.userId));
  }, [posts, searchResults, blockedUsers]);


  const sortedPosts = useMemo(() => {
    if (sortBy === 'popular') {
      return [...displayedPosts].sort((a, b) => b.likes - a.likes);
    }
    
    if (sortBy === 'nearby' && userLocation) {
      return [...displayedPosts].sort((a, b) => {
        const coordsA = cityCoordinates[a.city];
        const coordsB = cityCoordinates[b.city];
        if (!coordsA) return 1;
        if (!coordsB) return -1;
        const distanceA = getDistance(userLocation.lat, userLocation.lon, coordsA.lat, coordsA.lon);
        const distanceB = getDistance(userLocation.lat, userLocation.lon, coordsB.lat, coordsB.lon);
        return distanceA - distanceB;
      });
    }
    
    // Default sort is 'recent'
    return [...displayedPosts].sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
    });

  }, [displayedPosts, sortBy, userLocation]);

  const topContributors = useMemo<TopContributor[]>(() => {
    return users
      .map(user => {
        const postCount = posts.filter(p => p.userId === user.id).length;
        const score = postCount;
        return { user, score };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [posts, users]);
  
  const trendingLocations = useMemo<TrendingLocation[]>(() => {
    const cityCounts = posts.reduce<Record<string, number>>((acc, post) => {
      acc[post.city] = (acc[post.city] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city, postCount]) => ({ city, postCount }));
  }, [posts]);


  const selectedPost = posts.find(p => p.id === selectedPostId);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const paddingTopClass = 'pt-24 sm:pt-28';
  
  if (authLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-sky-blue to-vibrant-purple flex items-center justify-center text-white font-bold text-xl">Cargando SaldeFiesta...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-vibrant-purple text-white font-sans flex flex-col">
      <Header 
        currentUser={currentUser}
        onSearch={setSearchQuery}
        isSearching={isSearching}
        onProfileClick={() => currentUser && handleUserSelect(currentUser.id)} 
        onHomeClick={handleCloseDetail}
        onApplyFilters={() => {}}
        activeFilterCount={0}
        onLoginClick={() => setLoginModalOpen(true)}
        onSignUpClick={() => setSignUpModalOpen(true)}
        onLogoutClick={handleLogout}
        onFiestaFinderClick={() => setFiestaFinderOpen(true)}
      />
      <main className={`container mx-auto px-4 ${paddingTopClass} flex-grow`}>
        {view === 'feed' && (
          <>
            {!currentUser && (
                <>
                    <HeroSection onSignUpClick={() => setSignUpModalOpen(true)} onScrollToFeed={() => {}} />
                    <CallToActionUpload onSignUpClick={() => setSignUpModalOpen(true)} />
                </>
            )}
             <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                 <div ref={feedRef} className="space-y-6">
                  {currentUser && <button onClick={() => setUploadModalOpen(true)} className="w-full bg-festive-orange text-white font-bold py-3 px-6 rounded-full hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg mb-6">¡Comparte tu Fiesta!</button>}
                  <FeedFilters sortBy={sortBy} onSortChange={handleSortChange} />
                  <Feed 
                    posts={sortedPosts} 
                    users={users} 
                    onPostSelect={handlePostSelect} 
                    onUserSelect={handleUserSelect}
                    onLike={handleLike}
                    loadMorePosts={() => {}}
                    hasMore={false}
                    isSearchActive={!!searchResults}
                    currentUser={currentUser}
                  />
                </div>
              </div>
              <aside className="hidden lg:block lg:col-span-4">
                <GamificationSidebar 
                  topContributors={topContributors}
                  trendingLocations={trendingLocations}
                  onUserSelect={handleUserSelect}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
              </aside>
            </div>
          </>
        )}
        {view === 'post' && selectedPost && (
          <PostDetail
            post={selectedPost}
            user={users.find(u => u.id === selectedPost.userId)!}
            comments={(comments[selectedPost.id] || []).filter(c => !blockedUsers.has(c.userId))}
            users={users}
            onClose={handleCloseDetail}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onUserSelect={handleUserSelect}
            currentUser={currentUser}
            onBlockUser={handleBlockUser}
            onDeletePost={handleDeletePost}
            isOwner={currentUser?.id === selectedPost.userId}
          />
        )}
        {view === 'profile' && selectedUser && (
          <Profile 
            user={selectedUser} 
            posts={posts.filter(p => p.userId === selectedUser.id)} 
            onPostSelect={handlePostSelect}
            onBack={handleCloseDetail}
            currentUser={currentUser}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onOpenUploadModal={() => setUploadModalOpen(true)}
            onUpdateAvatar={handleUpdateAvatar}
            onRemoveAvatar={handleRemoveAvatar}
          />
        )}
      </main>
      
      {isFiestaFinderOpen && <FiestaFinder onClose={() => setFiestaFinderOpen(false)} />}
      
      {geolocationStatus && (
        <GeolocationModal 
          status={geolocationStatus}
          onClose={() => setGeolocationStatus(null)}
          onAllow={handleAllowGeolocation}
          onManualSearch={() => {}}
          cities={Object.keys(cityCoordinates)}
        />
      )}

      {isUploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} onUpload={handleUpload} />}
      {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} onSwitchToSignUp={() => { setLoginModalOpen(false); setSignUpModalOpen(true); }} />}
      {isSignUpModalOpen && <SignUpModal onClose={() => setSignUpModalOpen(false)} onSignUp={handleSignUp} onGoogleSignIn={handleGoogleSignIn} onSwitchToLogin={() => { setSignUpModalOpen(false); setLoginModalOpen(true); }} />}
      
      {legalModalContent && (
        <LegalModal 
            title={legalModalContent}
            content={legalTexts[legalModalContent]}
            onClose={() => setLegalModalContent(null)}
        />
      )}

      <Footer onLegalLinkClick={handleOpenLegalModal} />
    </div>
  );
};

export default App;