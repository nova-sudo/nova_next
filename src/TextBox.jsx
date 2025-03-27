import React from "react";
import {
  LifebuoyIcon,
  NewspaperIcon,
  PhoneIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";

const cards = [
  {
    name: "Lorem Ipsum",
    description:
      "Consectetur vel non. Rerum ut consequatur nobis unde. Enim est quo corrupti consequatur.",
    icon: PhoneIcon,
  },
  {
    name: "Lorem Ipsum",
    description:
      "Quod possimus sit modi rerum exercitationem quaerat atque tenetur ullam.",
    icon: LifebuoyIcon,
  },
  {
    name: "Lorem Ipsum",
    description:
      "Ratione et porro eligendi est sed ratione rerum itaque. Placeat accusantium impedit eum odit.",
    icon: NewspaperIcon,
  },
];

const TextBox = () => {
  return (
    <div className="relative isolate overflow-hidden bg-white rounded-lg border-blue-100 border-2 mt-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center justify-center pt-24 pb-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex justify-center space-x-4 mb-6">
            <AcademicCapIcon className="w-10 h-10 text-blue-400" />
            <BookOpenIcon className="w-12 h-12 text-blue-400" />
            <PencilIcon className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            I'm your AI-powered idea assistant
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            I'm here to help you brainstorm your project idea.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {cards.map((card) => (
            <div
              key={card.name}
              className="flex gap-x-4 rounded-xl bg-white/5 p-6 ring-1 ring-inset ring-gray-300"
            >
              <card.icon
                className="h-7 w-5 flex-none text-indigo-400"
                aria-hidden="true"
              />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-gray-900">{card.name}</h3>
                <p className="mt-2 text-gray-700">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextBox;
