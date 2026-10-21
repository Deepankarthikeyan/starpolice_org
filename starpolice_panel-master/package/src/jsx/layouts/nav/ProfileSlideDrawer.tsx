import ProfileDropdown from "./ProfileDropdown";

interface ProfileSlideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ProfileSlideDrawer = ({ open, onClose }: ProfileSlideDrawerProps) => {
  return (
    <>
      {open && (
        <button
          type="button"
          className="spa-profile-backdrop"
          aria-label="Close profile menu"
          onClick={onClose}
        />
      )}
      <aside
        className={`spa-profile-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
        aria-label="Profile menu"
      >
        <ProfileDropdown onClose={onClose} />
      </aside>
    </>
  );
};

export default ProfileSlideDrawer;
