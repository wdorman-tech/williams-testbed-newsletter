import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const requestRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const followerPosRef = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = () => {
      cursorRef.current?.classList.add('is-clicked');
      followerRef.current?.classList.add('is-clicked');
    };

    const onMouseUp = () => {
      cursorRef.current?.classList.remove('is-clicked');
      followerRef.current?.classList.remove('is-clicked');
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      const { x: mouseX, y: mouseY } = mouseRef.current;
      
      // Smooth follow logic for cursor (faster)
      cursorPosRef.current.x += (mouseX - cursorPosRef.current.x) * 0.2;
      cursorPosRef.current.y += (mouseY - cursorPosRef.current.y) * 0.2;
      
      // Smooth follow logic for follower (slower/drag)
      followerPosRef.current.x += (mouseX - followerPosRef.current.x) * 0.1;
      followerPosRef.current.y += (mouseY - followerPosRef.current.y) * 0.1;

      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPosRef.current.x}px, ${cursorPosRef.current.y}px, 0)`;
        followerRef.current.style.transform = `translate3d(${followerPosRef.current.x}px, ${followerPosRef.current.y}px, 0)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Separate effect for hover detection to avoid re-running the animation loop
  useEffect(() => {
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const addListeners = () => {
      const links = document.querySelectorAll('a, button, .interactive, input, textarea');
      links.forEach(link => {
        link.addEventListener('mouseenter', handleMouseEnter);
        link.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    const removeListeners = () => {
        const links = document.querySelectorAll('a, button, .interactive, input, textarea');
        links.forEach(link => {
          link.removeEventListener('mouseenter', handleMouseEnter);
          link.removeEventListener('mouseleave', handleMouseLeave);
        });
    };

    addListeners();

    // MutationObserver to handle dynamic content
    const observer = new MutationObserver((mutations) => {
      // Re-add listeners to new elements (simple approach: remove all and re-add)
      // For performance in large apps, you'd want to be more selective, but fine here.
      removeListeners(); 
      addListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      removeListeners();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isHovering) {
      cursorRef.current?.classList.add('is-hovering');
      followerRef.current?.classList.add('is-hovering');
    } else {
      cursorRef.current?.classList.remove('is-hovering');
      followerRef.current?.classList.remove('is-hovering');
    }
  }, [isHovering]);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-dot" />
      <div ref={followerRef} className="custom-cursor-follower" />
    </>
  );
}
