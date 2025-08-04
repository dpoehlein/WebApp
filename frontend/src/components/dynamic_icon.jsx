// src/components/dynamic_icon.jsx
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import * as GiIcons from 'react-icons/gi';
import * as BsIcons from 'react-icons/bs';
import * as BiIcons from 'react-icons/bi';
import * as SiIcons from 'react-icons/si';
import * as TbIcons from 'react-icons/tb';

const iconLibraries = {
  Md: MdIcons,
  Fa: FaIcons,
  Gi: GiIcons,
  Bs: BsIcons,
  Bi: BiIcons,
  Si: SiIcons,
  Tb: TbIcons
};

const DynamicIcon = ({ iconName, className }) => {
  const prefix = iconName.slice(0, 2); // e.g., "Md" from "MdNumbers"
  const iconLib = iconLibraries[prefix];
  const IconComponent = iconLib?.[iconName];

  return IconComponent ? <IconComponent className={className} /> : null;
};

export default DynamicIcon;
