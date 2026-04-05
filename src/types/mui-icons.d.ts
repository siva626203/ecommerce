declare module '@mui/icons-material' {
  import { SvgIconComponent } from '@mui/icons-material/index';

  export const Dashboard: SvgIconComponent;
  export const Inventory: SvgIconComponent;
  export const People: SvgIconComponent;
  export const ShoppingCart: SvgIconComponent;
  export const Logout: SvgIconComponent;
  export const Settings: SvgIconComponent;
}

declare module '@mui/icons-material/*' {
  import { SvgIconComponent } from '@mui/icons-material/index';

  const icon: SvgIconComponent;
  export default icon;
}
