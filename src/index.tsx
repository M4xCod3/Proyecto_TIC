import Navbar from src\Navbar.tsx

export default function Index(){
    return(
        <div classname='min-h-screen bg-bacground text-foreground'>
            <Navbar/>
            <Hero/>
            <About/>
            <Hardware/>
            <Contact/>
            <Footer/>
        </div>
    );
}