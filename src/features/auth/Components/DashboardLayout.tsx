return (
  <ProtectedRoute>
    <ProfileProvider>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  </ProtectedRoute>
);