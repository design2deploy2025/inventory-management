const people = [
  {
    name: 'Sarah Chen',
    role: 'Founder / CEO',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Marcus Johnson',
    role: 'Co-Founder / CTO',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

export default function Team() {
  return (
    <div className="relative flex flex-col items-center bg-black text-white text-sm pb-16 bg-center bg-cover">
      <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3 mt-20">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text sm:text-4xl">
            Meet our team
          </h2>
          <p className="mt-6 text-lg/8 text-slate-300">
            We are a dedicated team of developers and Instagram marketers who understand the challenges of managing inventory for social commerce.
          </p>
        </div>
        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {people.map((person) => (
            <li key={person.name}>
              <div className="flex items-center gap-x-6">
                <img
                  alt=""
                  src={person.imageUrl}
                  className="size-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                />
                <div>
                  <h3 className="text-base/7 font-semibold tracking-tight text-white">{person.name}</h3>
                  <p className="text-sm/6 font-semibold text-indigo-400">{person.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

