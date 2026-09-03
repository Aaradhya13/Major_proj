import hospitalNeuralBg from '../../assets/hospital-neural-bg.png'

function PageBackground({ children }) {
  return (
    <div
      className="relative isolate -m-4 min-h-[calc(100vh-5rem)] bg-cover bg-center bg-fixed bg-no-repeat p-4 sm:-mx-6 sm:-my-6 sm:p-6 lg:-mx-8 lg:-mb-10 lg:-mt-7 lg:p-8"
      style={{ backgroundImage: `url(${hospitalNeuralBg})`, backgroundAttachment: 'fixed' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/75" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default PageBackground