export default function HomePage() {
  return (
    <main style={{minHeight:"100vh",background:"#f5f7fb",padding:"24px",fontFamily:"Arial, sans-serif"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{background:"#fff",borderRadius:24,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.08)",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:14,letterSpacing:2,textTransform:"uppercase",color:"#4b5563"}}>Enrique's</div>
              <h1 style={{margin:"8px 0 0",fontSize:36,color:"#0f172a"}}>Host Stand Starter</h1>
              <p style={{marginTop:8,color:"#64748b"}}>Your Vercel deployment is working. This starter page confirms the app is live.</p>
            </div>
            <div style={{background:"#0f172a",color:"#fff",padding:"10px 16px",borderRadius:999,fontWeight:700}}>
              Live
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns":"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
          {[
            ["Reservations","Ready to connect"],
            ["Waitlist","Ready to connect"],
            ["Floor Map","Ready to connect"],
            ["Dashboard","Ready to connect"],
          ].map(([title,sub]) => (
            <div key={title} style={{background:"#fff",borderRadius:20,padding:20,boxShadow:"0 10px 24px rgba(0,0,0,.06)"}}>
              <div style={{fontSize:14,color:"#64748b"}}>{sub}</div>
              <div style={{fontSize:24,fontWeight:700,color:"#0f172a",marginTop:8}}>{title}</div>
            </div>
          ))}
        </div>

        <div style={{background:"#fff",borderRadius:24,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.08)"}}>
          <h2 style={{marginTop:0,color:"#0f172a"}}>Next steps</h2>
          <ol style={{color:"#334155",lineHeight:1.8,paddingLeft:20}}>
            <li>Upload these files into your GitHub repo.</li>
            <li>Redeploy in Vercel.</li>
            <li>Once this page loads, your deployment path is fixed.</li>
            <li>Then we can replace this starter with the full Enrique's Host Stand build.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
